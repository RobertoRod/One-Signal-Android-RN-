/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,

  KeyboardAvoidingView,
  TextInput,

  Button,

  ActivityIndicator

} from 'react-native';

import OneSignal from 'react-native-onesignal';



type Props = {};
export default class App extends Component<Props> {
  constructor(properties) {
    super(properties);
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  componentWillMount() {
    console.log("setting log level");
    OneSignal.setLogLevel(7, 0);
    this.setState({
      emailEnabled: false,
      animatingEmailButton: false,
      initialOpenFromPush: "Did NOT open from push",
      activityWidth: 0,
      width: 0,
      activityMargin: 0,
      buttonColor: Platform.OS == "ios" ? "#ffffff" : "#d45653",
      jsonDebugText: ""
    });
    OneSignal.setLocationShared(true);


    OneSignal.inFocusDisplaying(2)

    OneSignal.getPermissionSubscriptionState((response) => {
      console.log("Received permission subscription state: ", response);
    });
  }

  componentDidMount() {
    this.onReceived = this.onReceived.bind(this);
    this.onOpened = this.onOpened.bind(this);
    this.onIds = this.onIds.bind(this);
    this.onEmailRegistrationChange = this.onEmailRegistrationChange.bind(this);

    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);
    OneSignal.addEventListener('emailSubscription', this.onEmailRegistrationChange);
  }

  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('ids', this.onIds);
    OneSignal.removeEventListener('emailSubscription', this.onEmailRegistrationChange);
  }

  onEmailRegistrationChange(registration) {
    console.log("onEmailRegistrationChange: ", registration);
  }

  onReceived(notification) {
    console.log("Notification received: ", notification);
  }

  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }

  onIds(device) {
    console.log('Device info: ', device);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to the OneSignal Example!
        </Text>
        <Text style={styles.instructions}>
          Using {Platform.OS}? Cool.
        </Text>
        <View style={styles.buttonContainer}>
          <Button style={styles.button}
            onPress={() => {
              OneSignal.getPermissionSubscriptionState((subscriptionState) => {
                this.setState({ jsonDebugText: JSON.stringify(subscriptionState, null, 2) });
              });
            }}
            title="Print Subscription State"
            color={this.state.buttonColor}
          />
        </View>
        <KeyboardAvoidingView style={{ width: 300, height: 40, borderColor: '#d45653', borderWidth: 2, borderRadius: 5, marginTop: 8 }}>
          <TextInput style={styles.textInput}
            underlineColorAndroid='rgba(0, 0, 0, 0)'
            placeholderText='testing'
            placeholder='test@email.com'
            multiline={false}
            keyboardType='email-address'
            returnKeyType='done'
            textAlign='center'
            placeholderTextColor='#d1dde3'
            editable={true}
            autoCapitalize='none'
            keyboardAppearance='dark'
            onChangeText={(newText) => {
              console.log("New text: ", newText, ", is valid email? ", this.validateEmail(newText));
              this.setState({ emailEnabled: this.validateEmail(newText), email: newText });
            }}
          />
        </KeyboardAvoidingView>
        <View style={{ flexDirection: 'row', overflow: 'hidden' }}>
          <View style={styles.buttonContainer}>
            <Button style={styles.button}
              disabled={!this.state.emailEnabled}
              onPress={() => {
                this.setState({ animatingEmailButton: true, activityWidth: 20, activityMargin: 10 })

                OneSignal.setEmail(this.state.email, (error) => {
                  console.log("Sent email with error: ", error);

                  this.setState({ animatingEmailButton: false, activityWidth: 0, activityMargin: 0 })
                  OneSignal.setSubscription(true)
                });
              }}
              title="Set Test Email"
              color={this.state.buttonColor}
            />
          </View>
          <ActivityIndicator style={{ width: this.state.activityWidth, marginLeft: this.state.activityMargin }}
            animating={this.state.animatingEmailButton}
          />
          <View style={styles.buttonContainer}>
            <Button style={styles.button}
              onPress={() => {
                OneSignal.logoutEmail((error) => {
                  if (error) {
                    console.warn("Encountered error while attempting to log out: ", error);
                  } else {
                    OneSignal.setSubscription(false)
                    console.warn("Logged out successfully");
                  }
                });
              }}
              title="Logout Email"
              color={this.state.buttonColor}
            />
          </View>
        </View>
        <Text style={styles.jsonDebugLabelText}>
          {this.state.jsonDebugText}
        </Text>
      </View >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
