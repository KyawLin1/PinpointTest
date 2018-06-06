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
  Picker,
  AppState,
  PushNotificationIOS,
  Button,
} from 'react-native';

import NotificationsIOS from 'react-native-notifications';

import Amplify from 'aws-amplify';
import { PushNotification } from 'aws-amplify-react-native';
import aws_exports from './aws-exports';

// PushNotification need to work with Analytics
Amplify.configure(aws_exports);

export default class App extends Component {

  constructor(props) {
    super(props);

    this.handleAppStateChange = this.handleAppStateChange.bind(this);

    this.state = {
      seconds: 5,
    };

    // get the notification data
    PushNotification.onNotification((notification) => {
      // Note that the notification object structure is different from Android and IOS
      console.log('in app notification', notification);
      if(Platform.OS === 'ios') {
        PushNotificationIOS.setApplicationIconBadgeNumber(1);
        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      }
    });

    // get the registration token
    PushNotification.onRegister((token) => {
      console.log('in app registration', token);
    });
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    PushNotificationIOS.setApplicationIconBadgeNumber(0);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange(appState) {
    if(appState === 'background') {
      //TODO: Schedule background notification
      console.log('app is in background', this.state.seconds);

      let localNotification = NotificationsIOS.localNotification({
        alertBody: "Local Notifications!",
        alertTitle: "Local Notifications Title!",
        soundName: "chime.aiff",
        silent: false,
        category: "OPEN_APP",
        fireDate: new Date(Date.now() + (this.state.seconds * 1000)).toISOString(),
      });
      NotificationsIOS.scheduleLocalNotification(localNotification);
    }
  }

  registerNotifications = () => {
    PushNotification.configure(aws_exports);
  }

  unregisterNotifications = () => {
    PushNotificationIOS.abandonPermissions();
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Choose your notification time in seconds.
        </Text>
        <Button
          onPress={this.registerNotifications}
          title="Register Notifications"
        />
        <Button
          onPress={this.unregisterNotifications}
          title="Unregister Notifications"
        />
        <Picker
          style={styles.picker}
          selectedValue={this.state.seconds}
          onValueChange={(seconds) => this.setState({ seconds })}
        >
          <Picker.Item label="5" value={5}/>
          <Picker.Item label="10" value={10}/>
          <Picker.Item label="15" value={15}/>
        </Picker>
      </View>
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
  picker: {
    width: 100,
  }
});
