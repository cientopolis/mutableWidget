import React, { Component } from 'react'
import * as Permissions from 'expo-permissions'
import constants, {
  NONE,
  ANY,
  WIFI,
  CELLULAR,
  NO_POWER_SAVER,
} from './constants'
import NetInfo from '@react-native-community/netinfo'
import * as Battery from 'expo-battery'

import permisionMap from './PermissionMap'

class PermissionAwareComponent extends Component {

  constructor(props) {
    super(props)

    this.state = {
      // Se guarda el componente a renderizar. Por defecto el comp por defecto. 
      componentToRender: props.defaultComponent,
    }
  }

  // Por un comp de la lista (indice) llama al evaluador, quien le dice si puede reendizar, sino recursion con el indice siguiente
  async askForPermissions(permissionComponentList, index) {
    console.log("INDEX = " + index)
    console.log(permissionComponentList[index])
    if (index != permissionComponentList.length) {
      status = await this.handleComponentEvaluation(permissionComponentList[index])
      if (status == 'denied') {
        this.askForPermissions(permissionComponentList, index + 1)
      }
    }
  }

  // Evaluador de condiciones de un componente
  async handleComponentEvaluation({ permission, connectionRequire, powerSaverCondition, battteryLevelRequire, component }) {
    // Evalua las condiciones de bateria (mediante metodos correspodientes): power saver mode and battery level
    console.log("---- Evaluacion de condicion de bateria ----")
    const satisfiedPowerSaver = await this.handlePowerSaver(powerSaverCondition)
    console.log("Satisfied Power Saver: " + satisfiedPowerSaver)
    const satisfiedBatteryLevel = await this.handleBatteryLevel(battteryLevelRequire)
    console.log("Satisfied Battery Level: " + satisfiedBatteryLevel)
    const sufficientBattery = satisfiedPowerSaver && satisfiedBatteryLevel
    console.log("Condicion de bateria final: " + sufficientBattery)
    // Pide y evalua cada permiso necesario
    // Evalua la conexion actual con la requerida
    console.log("---- Evaluacion de condicion de conexion ----")
    const connection = await this.handleConnection(connectionRequire)
    const { status } = (permission !== undefined && sufficientBattery && connection) ?
      Array.isArray(permission) ?
        await Permissions.askAsync(...permission.map(each => permisionMap(each))) :
        await Permissions.askAsync(permisionMap(permission))
      : ({ status: 'granted' })
    // await this.handleConnection(connectionRequire)
    // console.log("Resultado de la evaluacion: " + connection)
    // Si se cumplen todas las condiciones setea el estado y devuelve el estado del componente evaluado
    if ((status === 'granted') && connection && sufficientBattery) this.setState(() => ({ componentToRender: (component) }))
    return (connection && battteryLevelRequire) ? status : 'denied'
  }

  // Evaluar la condicion de activacion del modo ahorro de bateria
  async handlePowerSaver(battteryLevelRequire) {
    if (battteryLevelRequire === NO_POWER_SAVER) {
      return !  await Battery.isLowPowerModeEnabledAsync()
    } else {
      return true
    }
  }

  // Evalua el porcentaje actual de bateria
  async handleBatteryLevel(battteryLevelRequire) {
    if (battteryLevelRequire !== undefined) {
      const batteryLevel = await Battery.getBatteryLevelAsync()
      return ((batteryLevel * 100) >= battteryLevelRequire)
    } else {
      return true
    }
  }

  // Evalua si existe conexion y el tipo de conexion actual
  async handleConnection(connectionRequire) {
    console.log("Conexion requerida: " + connectionRequire)
    return NetInfo.fetch().then(state => {
      console.log('Connection type', state.type);
      console.log('Is connected?', state.isConnected);
      switch (connectionRequire) {
        case WIFI:
          const res = state.isConnected && state.type === WIFI
          console.log("res = " + res)
          return res
        case CELLULAR['4g']:
          return state.isConnected && state.type === CELLULAR['4g']
        case CELLULAR['3g']:
          return state.isConnected && state.type === CELLULAR['3g']
        case CELLULAR['2g']:
          return state.isConnected && state.type === CELLULAR['2g']
        case ANY:
          return state.isConnected
        case NONE:
          return !state.isConnected
        default:
          return true
      }
    })
  }


  // Recibe por props el listado de componentes. Llama al manejador incial. 
  componentDidMount() {
    const {
      permissionComponentList
    } = this.props
    console.log(permissionComponentList)
    this.askForPermissions(permissionComponentList, 0)
  }



  render() {
    const {
      componentToRender
    } = this.state

    return componentToRender
  }

}

export const PermissionAware = PermissionAwareComponent
export const PermissionConstants = constants

export default PermissionAwareComponent