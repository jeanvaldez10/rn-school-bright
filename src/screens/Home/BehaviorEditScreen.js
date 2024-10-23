import React from 'react';
import {BackHandler, FlatList, Image, TouchableOpacity, View, KeyboardAvoidingView, Platform} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import NextButton from '../../components/NextButton';
import Color from '../../constants/color';
import {SafeAreaView} from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import BackNavigationBar from '../../components/BackNavigationBar';
import AlertWithImageModal from '../../components/AlertWithImageModal';
import Images from '../../themes/Images';
import translang from '../../utils/language.utils';
import CustomRadioButtonItem from '../../components/CustomRadioButtonItem';
import ProgressHud from '../../components/ProgressHud';
import ApiManager from '../../managers/ApiManager';
import _ from 'lodash';
import * as ImagePicker from 'react-native-image-picker';
import CustomTextInput from "../../components/CustomTextInput";

export default class BehaviorEditScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModal: false,
            showErrorModal: false,
            modalBody: '',
            userInfo: {},
            scoreData: [],
            selectedIndexes: [],
            studentList: [],
            classLevel: {},
            classRoom: {},
            isReduce: false,

            attachedImages: [],
            isRefresh: false,
        };
    }

    handleBackButton = () => {
        this.back();
        return true;
    };

    init = () => {
        const userInfo = this.props.navigation.getParam('userInfo');
        const studentList = this.props.navigation.getParam('students');
        const classLevel = this.props.navigation.getParam('classLevel');
        const classRoom = this.props.navigation.getParam('classRoom');
        const isReudce = this.props.navigation.getParam('isReduce') ?? false;
        const isRefresh = this.props.navigation.getParam('isRefresh') ?? false;


        this.setState({
            userInfo: userInfo,
            studentList: studentList,
            classLevel: classLevel,
            classRoom: classRoom,
            isReduce: isReudce,
            isRefresh: false,
        }, () => {
            if (isRefresh){
                this.getScoreList();
            }
        });
    }

    async componentDidMount() {
        console.log("BehaviorEditScreen");
        const {navigation} = this.props;

        this.focusListener = navigation.addListener("didFocus", () => {
            if (this.backhandler) {
                this.backhandler.remove();
            }
            console.log("Init");
            this.init();
            this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
        });

    }

    componentWillUnmount = () => {
        if (this.backhandler) {
            this.backhandler.remove();
        }
        if (this.focusListener) {
            this.focusListener.remove();
        }
    };

    back = () => {
        // this.props.navigation.pop(1);
        if (this.backhandler) {
            this.backhandler.remove();
        }

        const parentRoute = this.props.navigation.getParam('parent') ?? 'App';
        this.props.navigation.navigate(parentRoute);
    };

    getScoreList = () => {
        this.setState({isLoading: true});
        const promise = this.state.isReduce ? ApiManager.getReduceBehaviorScoreList(this.state.userInfo.SchoolID) : ApiManager.getAddBehaviorScoreList(this.state.userInfo.SchoolID);
        promise.then(list => {
            this.setState({isLoading: false, scoreData: list, selectedIndexes: []});
        }).catch(error => {
            console.log(error);
            this.setState({isLoading: false});
        });
    }

    __next = async () => {
        if (this.state.selectedIndexes.length === 0) {
            this.setState({showErrorModal: true, modalBody: translang.t('COMMON_msg_select_one')});
        } else {
            const scores = this.state.selectedIndexes.map(value => {
                return this.state.scoreData[value];
            });

            const params = {
                scores: scores,
                classLevel: this.state.classLevel,
                classRoom: this.state.classRoom,
                students: this.state.studentList,
                isReduce: this.state.isReduce,
                userInfo: this.state.userInfo,
                attachedImages: this.state.attachedImages,
            };

            this.props.navigation.navigate('BehaviorSubmit', params);
        }
    };

    onSelectItem = (index) => {
        const data = this.state.scoreData[index];
        this.setState({showModal: true, modalBody: data.BehaviorsName})
    };

    onTapItemRadio = (index) => {
        let selectedIndexes = this.state.selectedIndexes;
        if (selectedIndexes.includes(index)) {
            selectedIndexes = _.without(selectedIndexes, index);
        } else {
            selectedIndexes.push(index);
        }
        this.setState({selectedIndexes});
    };

    onChooseImage = () => {
        const options = {
            mediaType: 'photo',
            selectionLimit: 0,
        }

        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.assets) {
                const uris = response.assets.map(asset => {
                    return asset.uri;
                });
                this.setState({attachedImages: uris});
            }
        });
    };

    onChooseImageIndex = (index) => {
        const options = {
            mediaType: 'photo',
            selectionLimit: 0,
        }


        ImagePicker.launchImageLibrary(options, (response) => {
            if (response.assets) {
                const uris = response.assets.map(asset => {
                    return asset.uri;
                });
                let scoreData = this.state.scoreData;
                let attachedImages = scoreData[index].attachedImages ?? [];
                scoreData[index].attachedImages = attachedImages.concat(response.assets);
                this.setState({scoreData: scoreData});
            }
        });
    };

    renderAttachImages = (item, index0, index) => {
        return (
            <View style={{marginHorizontal: 3, position: 'relative', padding: 8,}}>

                <Image style={{width: 70, height: 50}} source={{uri: item.uri}}/>
                <TouchableOpacity style={{position: 'absolute', top: 0, right: 0}}
                                  onPress={() => this.removeAttachItem(index0, index)}>
                    <Image style={{width: 16, height: 16, resizeMode: 'contain'}} source={Images.n_close_circle}/>
                </TouchableOpacity>
            </View>
        )
    }

    removeAttachItem = (index0, index) => {
        console.log('remove:', index0, index);
        let scoreData = this.state.scoreData;
        scoreData[index].attachedImages = scoreData[index].attachedImages.filter((item, idx) => index0 != idx);
        this.setState({scoreData: scoreData});
    }

    toggleNote = (index) => {
        const showNote = this.state.scoreData[index].showNote ?? false;
        let scoreData = this.state.scoreData;
        scoreData[index].showNote = !showNote;
        this.setState({scoreData: scoreData});
    }

    updateNote = (index, text) => {
        let scoreData = this.state.scoreData;
        scoreData[index].Note = text;
        this.setState({scoreData: scoreData});
    }

    renderItem = (index0) => {
        const data = this.state.scoreData[index0];
        let showNote = false;
        if (data.showNote) {
            showNote = true;
        }
        const note = data.Note ?? '';
        const attachedImages = data.attachedImages ?? [];
        const isSelected = this.state.selectedIndexes.includes(index0);
        return (
            <View style={{marginBottom:12}}>
                <TouchableOpacity style={styles.listItem} onPress={() => this.onSelectItem(index0)}>
                    <View style={styles.listItemView}>
                        <CustomRadioButtonItem
                            isSelected={isSelected}
                            selectedColor={this.state.isReduce ? Color.n_default_orange : Color.n_button_gradient_green_start}
                            onPress={() => this.onTapItemRadio(index0)}
                            radioSize={30}/>
                        <Text style={styles.scoreDescription}>{data.BehaviorsName}</Text>
                        <Text
                            style={[styles.scoreValue, this.state.isReduce ? {color: Color.n_default_orange} : {color: Color.n_button_gradient_green_start}]}>{this.state.isReduce ? `-${data.Score}` : `+${data.Score}`}</Text>

                        <View>
                            <TouchableOpacity style={{...styles.flexButton, backgroundColor: Color.n_default_orange}}
                                              onPress={() => this.onChooseImageIndex(index0)}>
                                <Text style={styles.flexButtonText}>{translang.t('Attached_Pictures')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    ...styles.flexButton,
                                    backgroundColor: Color.green_button_next_color2,
                                    marginTop: 8
                                }}
                                onPress={() => this.toggleNote(index0)}>
                                <Text style={styles.flexButtonText}>{translang.t('Note')}</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </TouchableOpacity>
                {attachedImages.length > 0 &&
                <View style={styles.attachContainer}>
                    <FlatList
                        style={{flex: 0}}
                        data={attachedImages}
                        keyExtractor={(item, index) => index.toString()}
                        ItemSeparatorComponent={this.ItemSeparatorView}
                        renderItem={({item, index}) => this.renderAttachImages(item, index, index0)}
                        horizontal
                    />
                </View>
                }
                {showNote &&
                <View style={styles.noteContainer}>
                    <View style={styles.listItemTextBox}>
                        <CustomTextInput placeholder={translang.t("Note_placeholder")} value={note}
                                         onChangeText={(text) => {
                                             this.updateNote(index0, text)
                                         }}/>
                        <TouchableOpacity style={styles.deleteIconBox} onPress={() => {
                            this.updateNote(index0, '')
                        }}>
                            <Image source={Images.n_img_trash} style={styles.deleteIcon}/>
                        </TouchableOpacity>
                    </View>
                </View>}
            </View>

        );
    };

    render() {
        const nextButtonColor = this.state.isReduce ? [Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end] : [Color.n_button_gradient_green_start, Color.n_button_gradient_green_end]

        return (
            <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.container}>
                <BackNavigationBar
                    title={this.state.isReduce ? translang.t('DRAWER_reduce_behavior') : translang.t('DRAWER_add_behavior')}
                    onMenuTap={() => this.back()}
                />

                <View style={styles.container}>
                    <FlatList style={styles.list}
                              data={this.state.scoreData}
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({item, index}) => this.renderItem(index)}
                    />
                    <NextButton
                        label={translang.t('COMMON_next')}
                        containerStyle={{width: '90%', marginLeft: 'auto', marginRight: 'auto', marginVertical: 15,}}
                        buttonStyle={{height: 75, borderRadius: 38}}
                        colors={nextButtonColor}
                        isVerticalGradient={false}
                        _onPress={() => this.__next()}/>
                </View>
                </KeyboardAvoidingView>

                <AlertWithImageModal
                    isVisible={this.state.showModal}
                    image={this.state.isReduce ? Images.crying_new : Images.happy_new}
                    message={this.state.modalBody}
                    buttonColors={nextButtonColor}
                    isVerticalGradient={false}
                    onClose={() => {
                        this.setState({showModal: false})
                    }}
                />
                <AlertWithImageModal
                    isVisible={this.state.showErrorModal}
                    image={Images.n_ic_warning}
                    message={this.state.modalBody}
                    buttonColors={[Color.n_button_gradient_orange_start, Color.n_button_gradient_orange_end]}
                    isVerticalGradient={false}
                    onClose={() => {
                        this.setState({showErrorModal: false})
                    }}
                />
                <ProgressHud isVisible={this.state.isLoading}/>
            </SafeAreaView>
        );
    }
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.n_background_white
    },
    titleContainer: {
        width: '100%',
        paddingVertical: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Color.bluegray,
    },
    title: {
        fontSize: 16,
        fontWeight: '300',
    },
    list: {
        flex: 1,
        marginTop: 20,
    },
    listItem: {
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,

        marginVertical: 5,
        marginHorizontal: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
    },

    listItemView: {
        height: 100,
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },

    listItemTextBox: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Color.n_default_gray_dark,
        paddingHorizontal: 10,
    },

    deleteIconBox: {
        position: 'absolute',
        right: 5,
        top: 5,
    },

    deleteIcon: {
        width: 18,
        height: 18,
    },

    scoreDescription: {
        flex: 1,
        fontFamily: 'THSarabunNew',
        fontSize: 16,
        color: Color.n_default_gray,
        marginLeft: 16,

    },
    scoreValue: {
        fontFamily: 'THSarabunNew',
        fontSize: 30,
        fontWeight: 'bold',
        marginHorizontal: 30,
    },
    buttonStyle: {
        width: '100%',
        height: 60,
        borderRadius: 5,
        backgroundColor: Color.green_button_next_color1,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
    },
    noteContainer: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,

        borderRadius: 20,

        paddingHorizontal: 8,
        paddingVertical: 8,

        marginVertical: 2,
        marginHorizontal: 10,
    },
    attachContainer: {
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 3,

        borderRadius: 15,

        paddingHorizontal: 10,
        paddingVertical: 0,

        marginVertical: 2,
        marginHorizontal: 10,
    },
    chooseImageButton: {
        width: 100,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        backgroundColor: Color.n_default_orange,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.4,
        shadowRadius: 1,
    },
    chooseImageButtonText: {
        color: Color.white,
        textAlign: 'center',
        lineHeight: 16,
        fontSize: 12,
        fontWeight: '600',
    },
    flexButton: {
        width: 120,
        height: '40%',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Color.green_button_next_color2,
    },
    flexButtonText: {
        fontSize: 12,
        color: Color.n_background_white,
        textAlign: 'center'
    }
});
