import { StyleSheet, View, Alert, Image, TouchableHighlight, BackHandler, Linking, PermissionsAndroid } from "react-native";
import React from 'react';
import Status from "./components/Status";
import MessageList from "./components/MessageList";
import Toolbar from "./components/Toolbar";
import ImageGrid from "./components/ImageGrid";
import { createImageMessage, createLocationMessage, createTextMessage } from "./utils/MessageUtils";
import * as Location from 'expo-location';
import { Platform } from "expo-modules-core";
import { ToastAndroid } from "react-native";
import { get } from "react-native/Libraries/Utilities/PixelRatio";

import KeyboardState from "./components/KeyboardState";
import MeasureLayout from './components/MeasureLayout';
import MessagingContainer, {INPUT_METHOD} from "./components/MessagingContainer";

export default class App extends React.Component {
  state = {
    messages: [
      createImageMessage('https://unsplash.it/300/300'),
      createTextMessage('World'),
      createTextMessage('Hello'),
      createLocationMessage({
        latitude: 37.78825,
        longitude: -122.4324
      }),
    ],
    fullscreenimageid: null,
    isInputFocused: false,
    inputMethod: INPUT_METHOD.NONE,
  };

  handleChangeInputMethod = (inputMethod) => {
    this.setState({ inputMethod });
  }

  handlePressToolbarCamera = () => {
    this.setState({
      isInputFocused: false,
      inputMethod: INPUT_METHOD.CUSTOM
    });
  }

  handlePressToolbarLocation = async () => {
    const { messages } = this.state;

    let { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      this.setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});

    const { coords: { latitude, longitude }} = location;

    this.setState({
      messages: [
        createLocationMessage({
          latitude,
          longitude,
        }),
        ...messages
      ]
    });
  }

  setErrorMsg = (msg) => {
    Alert.alert(msg);
    console.log(msg);
  }

  handleChangeFocus = (isFocused) => {
    this.setState({ isInputFocused: isFocused });
  }

  handleSubmit = (text) => {
    const { messages } = this.state;

    this.setState({
      messages: [createTextMessage(text), ...messages],
    });
  }

  componentDidMount() {
    this.unsubscribe = BackHandler.addEventListener("hardwareBackPress", () => {
      const { fullscreenimageid } = this.state;

      if (fullscreenimageid) {
        this.dismissFullscreenImage();
        return true;
      }

      return false;
    });
  }

  componentWillUnmount() {
    this.unsubscribe.remove();
  }

  dismissFullscreenImage = () => {
    this.setState({ fullscreenimageid: null});
  }

  handlePressImage = (uri) => {
    const { messages } = this.state;

    this.setState({
      messages: [
        createImageMessage(uri),
        ...messages
      ],
    })
  }

  handlePressMessage = ({ id, type }) => {
    switch (type) {
      case 'text':
        Alert.alert(
          'Delete message?',
          'Are you sure you want to permanently delete this message?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                const { messages } = this.state;
                this.setState({
                  messages: messages.filter(message => message.id !== id)
                })
              }

            }
          ]
        )
        break;
      case 'image':
        this.setState({ fullscreenimageid: id, isInputFocused: false});
        break;
      default:
        break;
    }
  }

  renderMessageList() {
    return (
      <View style={styles.content}>
        <MessageList messages={this.state.messages} onPressMessage={this.handlePressMessage}/>
      </View>
    );
  }

  renderInputMethodEditor() {
    return (
      <View style={styles.inputMethodEditor}>
        <ImageGrid onPressImage={this.handlePressImage}/>
      </View>
    );
  }

  renderToolbar() {
    const { isInputFocused } = this.state;

    return (
      <View style={styles.toolbar}>
        <Toolbar
          isFocused={isInputFocused}
          onSubmit={this.handleSubmit}
          onChangeFocus={this.handleChangeFocus}
          onPressCamera={this.handlePressToolbarCamera}
          onPressLocation={this.handlePressToolbarLocation}
        />
      </View>
    );
  }

  renderFullscreenImage = () => {
    const { messages, fullscreenimageid } = this.state;

    if (!fullscreenimageid) {
      return null;
    }

    const image = messages.find(message => message.id == fullscreenimageid);

    if (!image) {
      return null;
    }

    const { uri } = image;

    return (
      <TouchableHighlight style={styles.fullscreenOverlay} onPress={this.dismissFullscreenImage}>
        <Image style={styles.fullscreenImage} source={{ uri }}/>
      </TouchableHighlight>
    )
  }

  render() {
    const { inputMethod } = this.state;

    return (
      <View style={styles.container}>
        <Status />
        <MeasureLayout>
          {layout => (
            <KeyboardState layout={layout}>
              {keyboardInfo => (
                <MessagingContainer
                {...keyboardInfo}
                inputMethod={inputMethod}
                onChangeInputMethod={this.handleChangeInputMethod}
                renderInputMethodEditor={this.renderInputMethodEditor.bind(this)}
                >
                  {this.renderMessageList()}
                  {this.renderToolbar()}
                </MessagingContainer>
              )}
            </KeyboardState>
          )}
        </MeasureLayout>
        {this.renderFullscreenImage()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  content: {
    flex: 1,
    backgroundColor: 'white'
  },

  inputMethodEditor: {
    flex: 1,
    backgroundColor: 'white',
  },

  toolbar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.4)',
    backgroundColor: 'white'
  },

  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 2,
  },

  fullscreenImage: {
    flex: 1,
    resizeMode: 'contain'
  }
})