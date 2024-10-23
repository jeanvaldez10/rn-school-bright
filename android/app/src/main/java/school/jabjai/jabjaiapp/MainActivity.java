package school.jabjai.jabjaiapp;


import android.os.Bundle;
import android.os.Build;
import android.app.NotificationManager;
import android.app.NotificationChannel;
import android.content.Context;
import android.net.Uri;
import android.media.AudioAttributes;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import org.devio.rn.splashscreen.SplashScreen; // import this


public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "SchoolBright";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected ReactRootView createRootView() {
       return new RNGestureHandlerEnabledRootView(MainActivity.this);
      }
    };
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
	SplashScreen.show(this);
	
    super.onCreate(savedInstanceState);

    // Create notification channels
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationManager notificationManager = getSystemService(NotificationManager.class);

      // Call channel
      NotificationChannel channel_call = new NotificationChannel("channel_call", "Call Notifications", NotificationManager.IMPORTANCE_MAX);
      channel_call.setDescription("Call Notifications");
      channel_call.enableVibration(true);
      Context context = getApplicationContext();
      int resId = context.getResources().getIdentifier("src_resources_sounds_ringing_phone", "raw", context.getPackageName());
      channel_call.setSound(Uri.parse("android.resource://" + context.getPackageName() + "/" + resId), (new AudioAttributes.Builder()).build());
      notificationManager.createNotificationChannel(channel_call);

      // Others channel
      NotificationChannel channel_others = new NotificationChannel("channel_others", "Other Notifications", NotificationManager.IMPORTANCE_MAX);
      channel_others.setDescription("Other Notifications");
      notificationManager.createNotificationChannel(channel_others);
    }
  }
}
