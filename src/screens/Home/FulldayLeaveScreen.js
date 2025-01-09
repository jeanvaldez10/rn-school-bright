import React from "react";
import {
  Image,
  View,
  BackHandler,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Text } from "native-base";
import { ScaledSheet } from "react-native-size-matters";
import Color from "../../constants/color";
import { DrawerActions } from "react-navigation-drawer";
import { SafeAreaView } from "react-native-safe-area-context";
import BackNavigationBar from "../../components/BackNavigationBar";
import LeaveReasonListModal from "../../components/LeaveReasonListModal";
import CalendarModal from "../../components/CalendarModal";
import AlertWithImageModal from "../../components/AlertWithImageModal";
import NextButton from "../../components/NextButton";
import Storage from "../../managers/StorageManager";
import Images from "../../themes/Images";
import translang, { getCurrentLocale } from "../../utils/language.utils";
import moment from "moment";
import { ScrollView } from "react-native-gesture-handler";
import NetInfo from "@react-native-community/netinfo";
import ApiManager from "../../managers/ApiManager";
import LeaveInfoModal from "../../components/LeaveInfoModal";

export default class FulldayLeaveScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      modalBody: "",
      showLeaveReasonModal: false,
      showStartingDateModal: false,
      showEndingDateModal: false,
      selectedLeaveReason: -1,
      selectedStartingDate: null,
      selectedEndingDate: null,
      userInfo: {},
      leaveReasonList: [],
      leaveInfoList: [],

      isAddressRembemr: false,
      AddressInfo: {},

      showInfoModal: false,
    };
  }

  handleBackButton = () => {
    if (this.state.selectedStartingDate) {
      this.setState({ selectedStartingDate: false });
      return true;
    }

    if (this.state.selectedEndingDate) {
      this.setState({ selectedEndingDate: false });
      return true;
    }

    this.back();
    return true;
  };

  unsubscribe = null;

  async componentDidMount() {
    this.backhandler = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackButton
    );

    console.log("FulldayLeaveScreen");

    const userInfo = await Storage.getUserInfo();
    const isRemember = (await Storage.getRememberAddrStatus()) ?? false;
    const AddressInfo = (await Storage.getAddrInfo()) ?? {};

    const isStudent = !!userInfo.StudentId;

    let leaveTypes;
    if (isStudent) {
      leaveTypes = await ApiManager.getStudentLeaveType(userInfo.SchoolID);
    } else {
      leaveTypes = await ApiManager.getTeacherLeaveType(userInfo.SchoolID);
    }

    try {
      const leaveInfos = await ApiManager.getLeaveInfos(userInfo.ID);
      this.setState({
        leaveInfoList: leaveInfos,
      });
    } catch (e) {
      console.log("Error on fetching leave infos: ", e.message);
    }

    this.setState({
      userInfo: userInfo,
      leaveReasonList: leaveTypes,
      isAddressRembemr: isRemember,
      AddressInfo: AddressInfo,
    });
  }

  componentWillUnmount = () => {
    // this.unsubscribe();
  };

  back = () => {
    this.props.navigation.goBack();
  };

  toggleDrawer = () => {
    this.props.navigation.dispatch(DrawerActions.openDrawer());
  };

  __next = async () => {
    const { selectedLeaveReason, selectedStartingDate, selectedEndingDate } =
      this.state;

    if (selectedLeaveReason == null || selectedLeaveReason === -1) {
      // this.setState({ showModal: true, modalBody: translang.t('LEAVE_msg_leavereason') });
      this.setState({
        showModal: true,
        modalBody: translang.t("FILL_IN_THE_DETAIL"),
      });
      return;
    } else if (selectedStartingDate == null) {
      // this.setState({ showModal: true, modalBody: translang.t('LEAVE_msg_startingdate') });
      this.setState({
        showModal: true,
        modalBody: translang.t("FILL_IN_THE_DETAIL"),
      });
      return;
    } else if (selectedEndingDate == null) {
      // this.setState({ showModal: true, modalBody: translang.t('LEAVE_msg_endingdate') });
      this.setState({
        showModal: true,
        modalBody: translang.t("FILL_IN_THE_DETAIL"),
      });
      return;
    }

    const diff = moment(selectedStartingDate).diff(
      moment(selectedEndingDate),
      "days"
    );
    if (diff > 0) {
      this.setState({
        showModal: true,
        modalBody: translang.t("CORRECT_DATERANGE"),
      });
      return;
    }

    const params = {
      type: "FulldayLeave",
      leaveReason: selectedLeaveReason,
      leaveDate: selectedStartingDate,
      leaveToDate: selectedEndingDate,
      leaveSeasonIndex: -1,
      userInfo: this.state.userInfo,
      isAddressRembemr: this.state.isAddressRembemr,
      AddressInfo: this.state.AddressInfo,
    };
    this.props.navigation.navigate("LeaveInput", params);
  };

  _onChangeLeaveReason = () => {
    this.setState({
      showLeaveReasonModal: true,
    });
  };
  onLeaveReasonSelect = (item, index) => {
    if (item == null) {
      this.setState({ showLeaveReasonModal: false });
    } else {
      this.setState({ showLeaveReasonModal: false, selectedLeaveReason: item });
    }
  };

  _onChangeStartingDate = () => {
    this.setState({
      showStartingDateModal: true,
    });
  };
  onStartingDateSelect = (item) => {
    if (item == null) {
      this.setState({ showStartingDateModal: false });
    } else {
      this.setState({
        showStartingDateModal: false,
        selectedStartingDate: item,
      });
    }
  };

  _onChangeEndingDate = () => {
    if (!this.state.selectedStartingDate) {
      this.setState({
        showModal: true,
        modalBody: translang.t("SELECT_LEAVE_DATE"),
      });
      return;
    }
    this.setState({
      showEndingDateModal: true,
    });
  };
  onEndingDateSelect = (item) => {
    if (item == null) {
      this.setState({ showEndingDateModal: false });
    } else {
      this.setState({ showEndingDateModal: false, selectedEndingDate: item });
    }
  };

  render() {
    const {
      selectedLeaveReason,
      selectedStartingDate,
      selectedEndingDate,
      leaveReasonList,
    } = this.state;

    let leave_reason = "";
    if (selectedLeaveReason) {
      leave_reason =
        getCurrentLocale() == "th"
          ? selectedLeaveReason.typeName
          : selectedLeaveReason.typeNameEN;
    }

    let starting_date = "";
    if (selectedStartingDate != null) {
      starting_date = selectedStartingDate;
    }
    let ending_date = "";
    if (selectedEndingDate != null) {
      ending_date = selectedEndingDate;
    }

    return (
      <SafeAreaView style={styles.container} edges={["right", "top", "left"]}>
        <BackNavigationBar
          title={translang.t("DRAWER_leave")}
          onMenuTap={() => this.back()}
          is_info={true}
          onInfoTap={() => {
            this.setState({ showInfoModal: true });
          }}
        />

        <ScrollView
          style={styles.container}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <TouchableOpacity
            onPress={this._onChangeLeaveReason}
            style={styles.bigContainer}
            activeOpacity={1.0}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ ...styles.title2, textAlign: "center" }}>
                {translang.t("LEAVE_leavereason")}
              </Text>
              <Text style={{ ...styles.selectValueText }}>
                {leave_reason
                  ? leave_reason
                  : translang.t("LEAVE_msg_leavereason")}
              </Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this._onChangeStartingDate}
            style={styles.bigContainer}
            activeOpacity={1.0}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ ...styles.title2, textAlign: "center" }}>
                {translang.t("LEAVE_startingdate")}
              </Text>
              <Text style={{ ...styles.selectValueText }}>
                {starting_date
                  ? moment(starting_date).format("DD/MM/YYYY")
                  : translang.t("LEAVE_msg_startingdate")}
              </Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this._onChangeEndingDate}
            style={styles.bigContainer}
            activeOpacity={1.0}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ ...styles.title2, textAlign: "center" }}>
                {translang.t("LEAVE_endingdate")}
              </Text>
              <Text style={{ ...styles.selectValueText }}>
                {ending_date
                  ? moment(ending_date).format("DD/MM/YYYY")
                  : translang.t("LEAVE_msg_endingdate")}
              </Text>
            </View>
            <View style={styles.bottomline} />
          </TouchableOpacity>

          <NextButton
            label={translang.t("COMMON_next")}
            containerStyle={styles.buttonStyle}
            buttonStyle={{ borderRadius: 40 }}
            colors={[
              Color.green_button_next_color1,
              Color.green_button_next_color2,
            ]}
            isVerticalGradient={false}
            _onPress={() => this.__next()}
          />
        </ScrollView>

        <AlertWithImageModal
          isVisible={this.state.showModal}
          image={Images.alert_inbox}
          title=" "
          message={this.state.modalBody}
          buttonColors={[Color.red_orange]}
          onClose={() => {
            this.setState({ showModal: false });
          }}
        />

        <LeaveReasonListModal
          isVisible={this.state.showLeaveReasonModal}
          onListSelect={this.onLeaveReasonSelect}
          listData={leaveReasonList}
          dialogTtitle={translang.t("LEAVE_leavereason")}
        />

        <CalendarModal
          isVisible={this.state.showStartingDateModal}
          minDate={moment()}
          //type={'single'}
          onDateSelect={(result) => this.onStartingDateSelect(result)}
        />

        <CalendarModal
          isVisible={this.state.showEndingDateModal}
          //type={'single'}
          minDate={moment()}
          onDateSelect={(result) => this.onEndingDateSelect(result)}
        />

        <LeaveInfoModal
          isVisible={this.state.showInfoModal}
          onOkPress={() => {
            this.setState({ showInfoModal: false });
          }}
          leaveInfoList={this.state.leaveInfoList}
        />
      </SafeAreaView>
    );
  }
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  bigContainer: {
    flex: 1,
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 15,
    backgroundColor: "white",
    shadowColor: "black",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
    justifyContent: "center",
    minHeight: 200,
  },
  title2: {
    fontFamily: "THSarabunNew",
    fontSize: 30,
    fontWeight: "bold",
    color: Color.n_default_orange,
    marginTop: 20,
  },
  selectValueText: {
    width: "100%",
    textAlign: "center",
    fontFamily: "THSarabunNew",
    fontSize: 28,
    color: Color.n_default_gray,
    position: "absolute",
    bottom: 40,
  },
  bottomline: {
    height: 1,
    width: "100%",
    backgroundColor: Color.n_default_orange,
    position: "absolute",
    bottom: 35,
  },

  buttonStyle: {
    width: 290,
    marginVertical: 10,
    marginLeft: "auto",
    marginRight: "auto",
  },
});
