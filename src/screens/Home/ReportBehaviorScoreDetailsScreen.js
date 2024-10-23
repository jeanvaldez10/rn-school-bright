import React from 'react';
import {Image, View, BackHandler, TouchableOpacity, FlatList,} from 'react-native';
import {Text} from 'native-base';
import {ScaledSheet} from 'react-native-size-matters';
import Color from '../../constants/color';
import {SafeAreaView} from 'react-native-safe-area-context';
import BackNavigationBar from '../../components/BackNavigationBar';
import Images from '../../themes/Images';
import translang, {getCurrentLocale} from '../../utils/language.utils';
import _ from 'lodash';
import moment from 'moment'
import {ScrollView} from 'react-native-gesture-handler';
import {set} from "react-native-reanimated";
import ImageView from "react-native-image-viewing";
import MyImageView from "../../components/MyImageView";


export default class ReportBehaviorScoreDetailsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalBody: '',
            selectedClassLevel: null,
            selectedClass: null,
            selectedYear: null,
            selectedSemester: null,

            detailPlus: [],
            detailMinus: [],
            userInfo: {},
            selStudent: {},
            ImagesData: [],
            ImageIndex: 0,
            showImageView: false,
        };
    }

    handleBackButton = () => {
        this.back();
        return true;
    };

    componentDidMount() {
        const {navigation} = this.props;
        this.focusListener = navigation.addListener("didFocus", () => {
            if (this.backhandler) {
                this.backhandler.remove();
            }
            this.backhandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);

            console.log("ReportBehaviorScoreDetailsScreen111");

            const year = this.props.navigation.getParam('year');
            const semester = this.props.navigation.getParam('semester');
            const classLevel = this.props.navigation.getParam('classLevel');
            const classRoom = this.props.navigation.getParam('classRoom');
            const userInfo = this.props.navigation.getParam('userInfo');
            const selStudent = this.props.navigation.getParam('selStudent');


            const dataList = selStudent.BehaviorsHistory;
            let dataPlus = [];
            let dataMinus = [];

            dataList.forEach(item => {
                if (item.BehaviorsType == "1") {
                    dataMinus.push(item);
                } else {
                    dataPlus.push(item);
                }
            });

            this.setState({
                selectedClassLevel: classLevel,
                selectedClass: classRoom,
                selectedYear: year,
                selectedSemester: semester,
                userInfo: userInfo,
                selStudent: selStudent,
                detailPlus: dataPlus,
                detailMinus: dataMinus
            }, () => {

            });
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
        if (this.backhandler) {
            this.backhandler.remove();
        }

        this.props.navigation.navigate('ReportBehaviorStudentList');
    };


    onSelectItemPlus = (index) => {
        let temp = this.state.detailPlus;
        temp[index].expand = !temp[index].expand;

        this.setState({detailPlus: temp});

    }

    onSelectItemMinus = (index) => {
        let temp = this.state.detailMinus;
        temp[index].expand = !temp[index].expand;

        this.setState({detailMinus: temp});
    }

    clickImage = (item, index, item0) => {
        let imagesData = item0.fileUploads.map((item) => {
            return {uri: item.filename}
        });
         this.setState({ImagesData: imagesData, ImageIndex: index, showImageView: true});
    }

    renderAttachImages = (item, index, item0) => {
        return (
            <TouchableOpacity style={{position: 'relative', marginVertical: 10, marginRight: 10}} key={index}
                              onPress={() => {
                                  this.clickImage(item, index, item0)
                              }}>
                <Image style={{width: 100, height: 80, borderRadius: 4,}} source={{uri: item.filename}}/>
            </TouchableOpacity>
        )

    }

    renderPlusItem = (item, index) => {
        const strDate = item.Day ? moment(item.Day).format('DD MMMM YYYY') : '';
        const strDes = item.BehaviorsName ? item.BehaviorsName : '';
        const strScore = item.Score ? item.Score : '';

        let strSender;
        strSender =  item.TheacherName ? item.TheacherName : '';
        if (getCurrentLocale() == 'en'){
            strSender =  item.TheacherNameEN ? item.TheacherNameEN : strSender;
        }

        const strRemark = item.Note ? item.Note : '';
        let colorScore = Color.n_button_gradient_green_start;
        const item0 = item;

        return (
            <View style={styles.listItem}>
                <TouchableOpacity onPress={() => this.onSelectItemPlus(index)}>
                    <View>
                        <View style={{
                            flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            paddingHorizontal: 20,
                            paddingVertical: 15
                        }}>
                            <View style={{flexDirection: 'column', flex: 1, justifyContent: 'space-around'}}>
                                <Text style={{fontFamily: 'THSarabunNew', fontSize: 24,}}>{strDate}</Text>
                                <Text style={{fontFamily: 'THSarabunNew', fontSize: 20,}}>{strDes}</Text>
                            </View>
                            <Text style={{
                                fontFamily: 'THSarabunNew',
                                fontSize: 24,
                                color: colorScore,
                            }}>{"+" + strScore}</Text>
                        </View>

                        {item.expand && <View>
                            <View
                                style={{height: 1, backgroundColor: colorScore, marginHorizontal: 20, marginTop: 10}}/>
                            <View style={{
                                flexDirection: 'column',
                                flex: 1,
                                justifyContent: 'space-around',
                                paddingHorizontal: 20,
                                paddingVertical: 15
                            }}>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={{
                                        fontFamily: 'THSarabunNew',
                                        fontSize: 24,
                                        color: colorScore,
                                        width: 100
                                    }}>{translang.t('RECORDER')}</Text>
                                    <Text style={{fontFamily: 'THSarabunNew', fontSize: 20, flex: 1,}}
                                          multiline={true}>{" : " + strSender}</Text>
                                </View>

                                <View style={{flexDirection: 'row'}}>
                                    <Text style={{
                                        fontFamily: 'THSarabunNew',
                                        fontSize: 24,
                                        color: colorScore,
                                        width: 100
                                    }}>{translang.t('REMARK')}</Text>
                                    <Text style={{fontFamily: 'THSarabunNew', fontSize: 20, flex: 1,}}
                                          multiline={true}>{" : " + strRemark}</Text>
                                </View>

                                <View style={{flexDirection: 'row'}}>
                                    <FlatList
                                        style={{flex: 1}}
                                        data={item.fileUploads}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={({item, index}) => this.renderAttachImages(item, index, item0)}
                                        horizontal
                                    />
                                </View>
                            </View>
                        </View>}
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    renderMinusItem = (item, index) => {
        const strDate = item.Day ? moment(item.Day).format('DD MMMM YYYY') : '';
        const strDes = item.BehaviorsName ? item.BehaviorsName : '';
        const strScore = item.Score ? item.Score : '';

        let strSender;
        strSender =  item.TheacherName ? item.TheacherName : '';
        if (getCurrentLocale() == 'en'){
            strSender =  item.TheacherNameEN ? item.TheacherNameEN : strSender;
        }

        const strRemark = item.Note ? item.Note : '';
        let colorScore = Color.n_button_gradient_orange_start;
        const item0 = item;

        return (
            <View style={styles.listItem}>
                <TouchableOpacity onPress={() => this.onSelectItemMinus(index)}>
                    <View>
                        <View style={{
                            flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            paddingHorizontal: 20,
                            paddingVertical: 15
                        }}>
                            <View style={{flexDirection: 'column', flex: 1, justifyContent: 'space-around'}}>
                                <Text style={{fontFamily: 'THSarabunNew', fontSize: 24,}}>{strDate}</Text>
                                <Text style={{fontFamily: 'THSarabunNew', fontSize: 20,}}>{strDes}</Text>
                            </View>
                            <Text style={{
                                fontFamily: 'THSarabunNew',
                                fontSize: 24,
                                color: colorScore,
                            }}>{"-" + strScore}</Text>
                        </View>

                        {item.expand && <View>
                            <View
                                style={{height: 1, backgroundColor: colorScore, marginHorizontal: 20, marginTop: 10}}/>
                            <View style={{
                                flexDirection: 'column',
                                flex: 1,
                                justifyContent: 'space-around',
                                paddingHorizontal: 20,
                                paddingVertical: 15
                            }}>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={{
                                        fontFamily: 'THSarabunNew',
                                        fontSize: 24,
                                        color: colorScore,
                                        width: 100
                                    }}>{translang.t('RECORDER')}</Text>
                                    <Text style={{fontFamily: 'THSarabunNew', fontSize: 20, flex: 1,}}
                                          multiline={true}>{" : " + strSender}</Text>
                                </View>

                                <View style={{flexDirection: 'row'}}>
                                    <Text style={{
                                        fontFamily: 'THSarabunNew',
                                        fontSize: 24,
                                        color: colorScore,
                                        width: 100
                                    }}>{translang.t('REMARK')}</Text>
                                    <Text style={{fontFamily: 'THSarabunNew', fontSize: 20, flex: 1}}
                                          multiline={true}>{" : " + strRemark}</Text>
                                </View>
                                <View style={{flexDirection: 'row'}}>
                                    <FlatList
                                        style={{flex: 1}}
                                        data={item.fileUploads}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={({item, index}) => this.renderAttachImages(item, index, item0)}
                                        horizontal
                                    />
                                </View>
                            </View>
                        </View>}
                    </View>


                </TouchableOpacity>
            </View>
        );
    };

    render() {
        // const { searchVal, selectedClass, selectedYear, selectedSemester} = this.state;

        const {selStudent, selectedClass} = this.state;
        let name = selStudent.FirstNameTH + " " + selStudent.LastNameTH;
        if (getCurrentLocale() == 'en') {
            if (selStudent.FirstNameEN != "" && selStudent.FirstNameEN != null) {
                name = selStudent.FirstNameEN + " " + selStudent.LastNameEN;
            }
        }


        let profileImage = Images.man_user;
        if (selStudent.StudentPicture && selStudent.StudentPicture != "") {
            profileImage = {uri: selStudent.StudentPicture}
        }

        let StrclassName = ""
        if (selectedClass != null) {
            if (getCurrentLocale() === 'th') {
                StrclassName = selectedClass.NameTH;
            } else if (getCurrentLocale() === 'en') {
                StrclassName = selectedClass.NameEN;
            } else {
                StrclassName = selectedClass.NameTH;
            }
        }


        return (
            <SafeAreaView style={styles.container} edges={['right', 'top', 'left']}>
                <BackNavigationBar
                    title={translang.t('DRAWER_reportbehavior')}
                    onMenuTap={() => this.back()}
                />
                <View style={{flexDirection: 'row', alignItems: 'center', padding: 15,}}>
                    <Image source={profileImage} style={styles.itemAvatar}></Image>
                    <View style={{flexDirection: 'column', flex: 1, justifyContent: 'space-around', marginLeft: 10}}>
                        <Text style={styles.itemText}>{name}</Text>
                        <Text style={styles.itemText}>{StrclassName}</Text>
                    </View>
                </View>

                <ScrollView style={styles.container}>
                    <FlatList style={styles.list}
                              data={this.state.detailPlus}
                              ListHeaderComponent={
                                  () => {
                                      const {detailPlus} = this.state;
                                      if (detailPlus.length > 0) {
                                          return <Text
                                              style={styles.behaviorTitle}>{translang.t('DRAWER_add_behavior')}</Text>;
                                      }
                                      return <Text/>;
                                  }
                              }
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({item, index}) => this.renderPlusItem(item, index)}
                              scrollEnabled={false}
                    />


                    <FlatList style={styles.list}
                              data={this.state.detailMinus}
                              ListHeaderComponent={
                                  () => {
                                      const {detailPlus} = this.state;
                                      if (detailPlus.length > 0) {
                                          return <Text
                                              style={styles.behaviorTitle}>{translang.t('DRAWER_reduce_behavior')}</Text>;
                                      }
                                      return <Text/>;
                                  }
                              }
                              keyExtractor={(item, index) => index.toString()}
                              renderItem={({item, index}) => this.renderMinusItem(item, index)}
                              scrollEnabled={false}
                    />

                </ScrollView>
                <MyImageView
                    images={this.state.ImagesData}
                    imageIndex={this.state.ImageIndex}
                    presentationStyle={'formSheet'}
                    visible={this.state.showImageView}
                    onRequestClose={() => {
                        this.setState({showImageView: false});
                    }}/>
            </SafeAreaView>
        );
    }
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.n_background_white
    },
    title: {
        fontFamily: 'THSarabunNew',
        fontSize: 24,
        fontWeight: 'bold',
        color: Color.n_default_orange,
        marginVertical: 10,
        marginHorizontal: 20,
    },
    list: {
        flex: 1,
    },
    listItem: {
        backgroundColor: Color.white,
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
    },
    itemText: {
        fontFamily: 'THSarabunNew',
        fontSize: 25,
        color: Color.n_default_orange,
        fontWeight: 'bold',
    },
    itemAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginHorizontal: 8,
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

    behaviorDetailText: {
        fontFamily: 'THSarabunNew',
        fontSize: 24,
        fontWeight: 'bold',
    },
    behaviorTitle: {
        fontFamily: 'THSarabunNew',
        fontSize: 24,
        fontWeight: 'bold',
        color: Color.n_default_gray,
        marginVertical: 10,
        marginLeft: 10
    }
});
