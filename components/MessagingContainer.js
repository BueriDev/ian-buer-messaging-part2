import { BackHandler, Platform, LayoutAnimation, View, UIManager } from "react-native";
import PropTypes from 'prop-types';
import React from 'react';

export const INPUT_METHOD = {
    NONE: 'NONE',
    KEYBOARD: 'KEYBOARD',
    CUSTOM: 'CUSTOM'
};

export default class MessagingContainer extends React.Component {
    static propTypes = {
        containerHeight: PropTypes.number.isRequired,
        contentHeight: PropTypes.number.isRequired,
        keyboardHeight: PropTypes.number.isRequired,
        keyboardVisible: PropTypes.bool.isRequired,
        keyboardWillShow: PropTypes.bool.isRequired,
        keyboardWillHide: PropTypes.bool.isRequired,
        keyboardAnimationDuration: PropTypes.number.isRequired,

        inputMethod: PropTypes.oneOf(Object.values(INPUT_METHOD)).isRequired,
        onChangeInputMethod: PropTypes.func,

        children: PropTypes.node,
        renderInputMethodEditor: PropTypes.func.isRequired,
    };

    constructor() {
        super();
    
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    static defaultProps = {
        children: null,
        onChangeInputMethod: () => {},
    }

    componentDidUpdate(prevProps, prevState) {
       const { onChangeInputMethod } = prevProps;

       if (!prevProps.keyboardVisible && this.props.keyboardVisible) {
           onChangeInputMethod(INPUT_METHOD.KEYBOARD);
       } else if (prevProps.keyboardVisible && !this.props.keyboardVisible && prevProps.inputMethod !== INPUT_METHOD.CUSTOM) {
           onChangeInputMethod(INPUT_METHOD.NONE);
       }

       const { keyboardAnimationDuration } = this.props;

       // console.log(this.props)



       // console.log(keyboardAnimationDuration);


       /*
       const animation = LayoutAnimation.create(
           keyboardAnimationDuration,
           (Platform.OS === 'android' ? LayoutAnimation.Types.easeInEaseOut : LayoutAnimation.Types.keyboard),
           LayoutAnimation.Properties.opacity
       );
       */

        const animation = LayoutAnimation.create(keyboardAnimationDuration,
            (Platform.OS === 'android') ? LayoutAnimation.Types.easeInEaseOut : LayoutAnimation.Types.keyboard,
            LayoutAnimation.Properties.opacity);

        // console.log(animation);

        // console.log(animation.create.type);

        LayoutAnimation.configureNext(animation);
   }

   componentDidMount() {
       this.subscription = BackHandler.addEventListener('hardwareBackPress', () => {
           const { onChangeInputMethod, inputMethod } = this.props;

           if (inputMethod === INPUT_METHOD.CUSTOM) {
               onChangeInputMethod(INPUT_METHOD.NONE);
               return true;
           }

           return false;
       });
   }

   componentWillUnmount() {
       this.subscription.remove();
   }

   render() {
       const {
           children,
           renderInputMethodEditor,
           inputMethod,
           containerHeight,
           contentHeight,
           keyboardHeight,
           keyboardWillShow,
           keyboardWillHide
       } = this.props;

       // console.log(renderInputMethodEditor);

       const useContentHeight = keyboardWillShow || inputMethod === INPUT_METHOD.KEYBOARD;
       const containerStyle = {
           height: useContentHeight ? contentHeight : containerHeight
       };

       const showCustomInput = inputMethod === INPUT_METHOD.CUSTOM && !keyboardWillShow;

       const inputStyle = {
           height: showCustomInput ? keyboardHeight || 250 : 0
       };

       return (
           <View style={containerStyle}>
               {children}
               <View style={inputStyle}>{renderInputMethodEditor()}</View>
           </View>
       );

       /*
       return (
           <View style={containerStyle}>
               {children}
               <View style={inputStyle}>{renderInputMethodEditor()}</View>
           </View>
       );
       */
   }
}