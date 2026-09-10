# HIDDriverKit

## Context

Load this when a task names **HIDDriverKit** or one of the API topics below.

Apple categories: System.

[Apple documentation](https://developer.apple.com/documentation/hiddriverkit) · Source checked: 2026-09-10.

Apple’s short description (excerpt):

> Develop drivers for human-interface devices, such as keyboards, pointing devices, and digitizers like pens and touch pads.

## Pattern

Use the topic map below to select the API for the requested feature. Follow the [technology implementation workflow](../technology-workflow.md) before writing integration code.

Documented modules: `HIDDriverKit`.

Documentation language identifiers: occ.

### Availability from the landing page

| Platform | Introduced | Deprecated | Beta |
|---|---|---|---|
| DriverKit | 19.0 | — | No |
| macOS | 10.15 | — | No |

These are landing-page values, not availability guarantees for every member. Check the selected symbol and the installed SDK.

### Essentials

- [com.apple.developer.driverkit.transport.hid](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.transport.hid)
- [Handling Keyboard Events from a Human Interface Device](https://developer.apple.com/documentation/hiddriverkit/handling-keyboard-events-from-a-human-interface-device)
- [Handling Stylus Input from a Human Interface Device](https://developer.apple.com/documentation/hiddriverkit/handling-stylus-input-from-a-human-interface-device)

### Samples

- [DriverKit sample code](https://developer.apple.com/documentation/driverkit/driverkit-sample-code)

### Driver Interfaces

- [com.apple.developer.driverkit.family.hid.eventservice](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.family.hid.eventservice)
- [IOUserHIDEventDriver](https://developer.apple.com/documentation/hiddriverkit/iouserhideventdriver)
- [IOUserHIDEventService](https://developer.apple.com/documentation/hiddriverkit/iouserhideventservice)
- [IOHIDEventService](https://developer.apple.com/documentation/hiddriverkit/iohideventservice)

### Providers

- [com.apple.developer.driverkit.family.hid.device](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.driverkit.family.hid.device)
- [IOHIDInterface](https://developer.apple.com/documentation/hiddriverkit/iohidinterface)
- [IOUserUSBHostHIDDevice](https://developer.apple.com/documentation/hiddriverkit/iouserusbhosthiddevice)
- [IOUserHIDDevice](https://developer.apple.com/documentation/hiddriverkit/iouserhiddevice)
- [IOHIDDevice](https://developer.apple.com/documentation/hiddriverkit/iohiddevice)

### Events

- [IOHIDDigitizerStylusData](https://developer.apple.com/documentation/hiddriverkit/iohiddigitizerstylusdata)
- [IOHIDDigitizerTouchData](https://developer.apple.com/documentation/hiddriverkit/iohiddigitizertouchdata)

### HID Usage Tables

- [HID Usage Tables](https://developer.apple.com/documentation/hiddriverkit/hid-usage-tables)
- [Match Criteria](https://developer.apple.com/documentation/hiddriverkit/match-criteria)

### HID Device Data

- [IOHIDElement](https://developer.apple.com/documentation/hiddriverkit/iohidelement)
- [IOHIDDigitizerCollection](https://developer.apple.com/documentation/hiddriverkit/iohiddigitizercollection)
- [com.apple.developer.hid.virtual.device](https://developer.apple.com/documentation/bundleresources/entitlements/com.apple.developer.hid.virtual.device)
- [Low-Level Information](https://developer.apple.com/documentation/hiddriverkit/low-level-information)

### Reference

- [HIDDriverKit Macros](https://developer.apple.com/documentation/hiddriverkit/hiddriverkit-macros)

### Macros

- [kIOHIDDeviceApprovedCarPlayDeviceKey](https://developer.apple.com/documentation/hiddriverkit/kiohiddeviceapprovedcarplaydevicekey)
- [kIOHIDDeviceCarPlayDeviceKey](https://developer.apple.com/documentation/hiddriverkit/kiohiddevicecarplaydevicekey)
- [kIOHIDDeviceHIDRMHashKey](https://developer.apple.com/documentation/hiddriverkit/kiohiddevicehidrmhashkey)
- [kIOHIDEventServicePropertiesRequiredForMatching](https://developer.apple.com/documentation/hiddriverkit/kiohideventservicepropertiesrequiredformatching)
- [kIOHIDEventServiceSensorControlOptionsKey](https://developer.apple.com/documentation/hiddriverkit/kiohideventservicesensorcontroloptionskey)
- [kIOHIDSupportedEventMaskKey](https://developer.apple.com/documentation/hiddriverkit/kiohidsupportedeventmaskkey)
- [kIOHIDSupportedKeyboardUsagePairsKey](https://developer.apple.com/documentation/hiddriverkit/kiohidsupportedkeyboardusagepairskey)
- [kIOHIDSupportedVendorUsagePairsKey](https://developer.apple.com/documentation/hiddriverkit/kiohidsupportedvendorusagepairskey)

### Enumeration Cases

- [kHIDUsage_GenDevControls_BatteryStrength](https://developer.apple.com/documentation/hiddriverkit/khidusage_gendevcontrols_batterystrength)
- [kHIDUsage_LED_BlueLEDChannel](https://developer.apple.com/documentation/hiddriverkit/khidusage_led_blueledchannel)
- [kHIDUsage_LED_GoodStatus](https://developer.apple.com/documentation/hiddriverkit/khidusage_led_goodstatus)
- [kHIDUsage_LED_GreenLEDChannel](https://developer.apple.com/documentation/hiddriverkit/khidusage_led_greenledchannel)
- [kHIDUsage_LED_IndicatorBlue](https://developer.apple.com/documentation/hiddriverkit/khidusage_led_indicatorblue)
- [kHIDUsage_LED_IndicatorOrange](https://developer.apple.com/documentation/hiddriverkit/khidusage_led_indicatororange)
- [kHIDUsage_LED_LEDIntensity](https://developer.apple.com/documentation/hiddriverkit/khidusage_led_ledintensity)
- [kHIDUsage_LED_RGB_LED](https://developer.apple.com/documentation/hiddriverkit/khidusage_led_rgb_led)
- [kHIDUsage_LED_RedLEDChannel](https://developer.apple.com/documentation/hiddriverkit/khidusage_led_redledchannel)
- [kHIDUsage_LED_SystemMicrophoneMute](https://developer.apple.com/documentation/hiddriverkit/khidusage_led_systemmicrophonemute)
- [kHIDUsage_LED_WarningStatus](https://developer.apple.com/documentation/hiddriverkit/khidusage_led_warningstatus)
- [kHIDUsage_Snsr_Biometric_HeartRate](https://developer.apple.com/documentation/hiddriverkit/khidusage_snsr_biometric_heartrate)
- [kHIDUsage_Snsr_Data_Biometric_HeartRate](https://developer.apple.com/documentation/hiddriverkit/khidusage_snsr_data_biometric_heartrate)
- [kHIDUsage_Snsr_Data_Hinge](https://developer.apple.com/documentation/hiddriverkit/khidusage_snsr_data_hinge)
- [kHIDUsage_Snsr_Data_Hinge_Angle](https://developer.apple.com/documentation/hiddriverkit/khidusage_snsr_data_hinge_angle)
- [kHIDUsage_Snsr_Motion_GravityVector](https://developer.apple.com/documentation/hiddriverkit/khidusage_snsr_motion_gravityvector)
- [kHIDUsage_Snsr_Motion_LinearAccelerometer](https://developer.apple.com/documentation/hiddriverkit/khidusage_snsr_motion_linearaccelerometer)
- [kHIDUsage_Snsr_Other_HingeAngle](https://developer.apple.com/documentation/hiddriverkit/khidusage_snsr_other_hingeangle)

### Enumerations

- [IOHIDServiceSensorControlOptions](https://developer.apple.com/documentation/hiddriverkit/iohidservicesensorcontroloptions)

## Anti-Patterns

- Do not infer iOS support from membership in this directory; it also includes macOS, drivers, web services, tools, and legacy APIs.
- Do not treat this source-checked topic map as a compiled implementation or assume every member is available on the landing page’s minimum OS.
- Do not copy a similarly named framework’s setup. Select the exact symbol, language, target type, and entitlement requirements from its source.

Generated from `docs/apple/technologies.json`; refresh with `python3 scripts/sync-apple-technologies.py --refresh`.
