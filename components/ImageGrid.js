import { Image, StyleSheet, TouchableOpacity} from 'react-native';
import * as ImagePickerExpo from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import CameraRoll from 'expo-cameraroll';
import PropTypes from 'prop-types';
import React from 'react';

import Grid from './Grid';
import { Alert } from 'react-native-web';

const keyExtractor = ({ uri }) => uri;

export default class ImageGrid extends React.Component {
    static propTypes = {
        onPressImage: PropTypes.func,
    };

    static defaultProps = {
        onPressImage: () => {},
    };

    loading = false;
    cursor = null;

    state = {
        images: [],
    };

    componentDidMount() {
        this.getImages();
    }

    getImages = async (after) => {
        if (this.loading) {
            return;
        }

        this.loading = true;

        let { status } = await MediaLibrary.requestPermissionsAsync();

        if (status !== 'granted') {
            this.setErrorMsg("Camera roll permission denied");
            return;
        }

        const results = await CameraRoll.getPhotos({
            first: 20,
            after
        });

        const { edges, page_info: { has_next_page, end_cursor} } = results;

        const loadedImages = edges.map(item => item.node.image);

        this.setState(
            { 
                images: this.state.images.concat(loadedImages),
            },
            () => {
                this.loading = false;
                this.cursor = has_next_page ? end_cursor : null;
            });
    }

    setErrorMsg = (msg) => {
        Alert.alert(msg);
        console.log(msg);
      }

    renderItem = ({ item: { uri }, size, marginTop, marginLeft }) => {
        const { onPressImage } = this.props;

        const style = {
            width: size,
            height: size,
            marginLeft,
            marginTop
        };

        return (
            <TouchableOpacity
                key={uri}
                activeOpacity={0.75}
                onPress={() => onPressImage(uri)}
                style={style}>
                <Image source={{ uri }} style={styles.image}/>
            </TouchableOpacity>
        );
    }

    getNextImages = () => {
        if (!this.cursor) {
            return;
        }

        this.getImages(this.cursor);
    };

    render() {
        const { images } = this.state;

        return (
            <Grid 
                data={images}
                renderItem={this.renderItem}
                keyExtractor={keyExtractor}
                onEndReached={this.getNextImages}
            />
        );
    }
}

const styles = StyleSheet.create({
    image: {
        flex: 1,
    }
})