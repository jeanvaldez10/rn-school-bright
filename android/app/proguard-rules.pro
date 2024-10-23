# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

-keep public class com.dylanvann.fastimage.* {*;}
-keep public class com.dylanvann.fastimage.** {*;}
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$** {
  **[] $VALUES;
  public *;
}

-keep class com.facebook.react.** { *; }
-keep class com.yourapp.package.** { *; }
-keep class com.facebook.** { *; }
-keep class com.google.** { *; }
-keep class javax.** { *; }

-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-dontwarn com.facebook.react.**
-dontwarn javax.annotation.**
-dontwarn okio.**
-dontwarn okhttp3.**

-keep class com.horcrux.svg.** { *; }
-dontwarn com.horcrux.svg.**

-keep class com.github.react-native-chart-kit.** { *; }
-dontwarn com.github.react-native-chart-kit.**

-keep class com.horcrux.svg.** { *; }
-keep class com.horcrux.svg.SvgPackage { *; }
-dontwarn com.horcrux.svg.**

-keep class android.support.v4.** { *; }
-dontwarn android.support.v4.**
-keep class androidx.** { *; }
-dontwarn androidx.**