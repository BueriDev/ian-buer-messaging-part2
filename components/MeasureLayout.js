import Constants from 'expo-constants';
import { Platform, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import React from 'react';

export default class MeasureLayout extends React.Component {
    static propTypes = {
        children: PropTypes.func.isRequired,
    };

    state = {
        layout: null,
    };

    handleLayout = (event) => {
        const layout = event.nativeEvent.layout;

        this.setState({
            layout: {
                x: layout.x,
                y: layout.y + (Platform.OS === 'android' ? Constants.statusBarHeight : 0),
                width: layout.width,
                height: layout.height,
            }
        });
    }

    render() {
        const { children } = this.props;
        const { layout } = this.state;

        if (!layout) {
            return <View onLayout={this.handleLayout} style={styles.containter} />;
        }

        return children(layout);
    }
}

const styles = StyleSheet.create({
    containter: {
        flex: 1,
    }
});