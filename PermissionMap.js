import * as Permissions from 'expo-permissions'

import {
  NOTIFICATIONS,
  USER_FACING_NOTIFICATIONS,
  LOCATION,
  CAMERA,
  AUDIO_RECORDING,
  CONTACTS,
  // CAMERA_ROLL,
  MEDIA_LIBRARY,
  MEDIA_LIBRARY_WRITE_ONLY,
  CALENDAR,
  REMINDERS,
  SYSTEM_BRIGHTNESS,
  ANY_REQUIRED,  
} from './constants'

const permissionMap = permission => {
  switch (permission) {
    case NOTIFICATIONS:
      return Permissions.NOTIFICATIONS
    case USER_FACING_NOTIFICATIONS:
      return Permissions.USER_FACING_NOTIFICATIONS
    case LOCATION:
      return Permissions.LOCATION
    case CAMERA:
      return Permissions.CAMERA
    case AUDIO_RECORDING:
      return Permissions.AUDIO_RECORDING
    case CONTACTS:
      return Permissions.CONTACTS
    // case CAMERA_ROLL:
    //   return Permissions.CAMERA_ROLL
    case MEDIA_LIBRARY:
      return Permissions.MEDIA_LIBRARY
    case MEDIA_LIBRARY_WRITE_ONLY:
      return Permissions.MEDIA_LIBRARY_WRITE_ONLY
    case CALENDAR:
      return Permissions.CALENDAR
    case REMINDERS:
      return Permissions.REMINDERS
    case SYSTEM_BRIGHTNESS:
      return Permissions.SYSTEM_BRIGHTNESS
    default:
      return null
  }
}

export default permissionMap