import React, { Component } from 'react'
import * as Permissions from 'expo-permissions'
import constants, {
  NONE,
  ANY,
  WIFI,
  CELLULAR,
  NO_POWER_SAVER,
} from './constants'
import { NetInfo } from 'react-native'
import * as Battery from 'expo-battery'

import permisionMap from './PermissionMap'

class PermissionAwareComponent extends Component {

  constructor(props) {
    super(props)

    this.state = {
      // Se guarda el componente a renderizar. Por defecto el comp por defecto. 
      componentToRender:props.defaultComponent, 
    }
  }

  // Por un comp de la lista (indice) llama al evaluador, quien le dice si puede reendizar, sino recursion con el indice siguiente
  async askForPermissions(permissionComponentList, index) {
    if(index != permissionComponentList.length) {
      status = await this.handleComponentEvaluation(permissionComponentList[index])
      if(status === 'denied') {
        this.askForPermissions(permissionComponentList, index+1)
      }
    }
  }

  // Evaluador de condiciones de un componente
  async handleComponentEvaluation({permission,connectionRequire,powerSaverCondition, battteryLevelRequire, component }) {
    // Evalua las condiciones de bateria (mediante metodos correspodientes): power saver mode and battery level
    const sufficientBattery = await this.handlePowerSaver(powerSaverCondition) && await this.handleBatteryLevel(battteryLevelRequire)
    // Pide y evalua cada permiso necesario
    const { status } = (permission !== undefined && sufficientBattery) ? 
      Array.isArray(permission) ?
        await Permissions.askAsync(...permission.map(each => permisionMap(each))) :
        await Permissions.askAsync(permisionMap(permission))
      : ({status:'granted'})
    // Evalua la conexion actual con la requerida
    const connection = await this.handleConnection(connectionRequire)
    // Si se cumplen todas las condiciones setea el estado y devuelve el estado del componente evaluado
    if ((status === 'granted') && connection && sufficientBattery) this.setState(() => ({componentToRender:(component)}))
    return connection ? status : 'denied'
  }

  // Evaluar la condicion de activacion del modo ahorro de bateria
  async handlePowerSaver(battteryLevelRequire){
    if (battteryLevelRequire === NO_POWER_SAVER)
    {
      return !  await Battery.isLowPowerModeEnabledAsync() 
    }else{
      return true
    }
  }
  
  // Evalua el porcentaje actual de bateria
  async handleBatteryLevel(battteryLevelRequire){
    const batteryLevel = await Battery.getBatteryLevelAsync()
    return ( (batteryLevel * 100) >= battteryLevelRequire)
  }

  // Evalua si existe conexion y el tipo de conexion actual
  async handleConnection(connectionRequire = ANY){
    const connectionInfo = await NetInfo.getConnectionInfo()
    switch (connectionRequire) {
      case WIFI:
        return NetInfo.isConnected && connectionInfo.type === WIFI
      case CELLULAR['4g']:
        return NetInfo.isConnected && connectionInfo.effectiveType === CELLULAR['4g']
      case CELLULAR['3g']:
        return NetInfo.isConnected && connectionInfo.effectiveType === CELLULAR['3g']
      case CELLULAR['2g']:
        return NetInfo.isConnected && connectionInfo.effectiveType === CELLULAR['2g']
      case ANY:
        return NetInfo.isConnected
      case NONE:
        return !NetInfo.isConnected
      default:
        return true
    }
  }
  

  // Recibe por props el listado de componentes. Llama al manejador incial. 
  componentDidMount() {
    const {
      permissionComponentList
    } = this.props

    this.askForPermissions(permissionComponentList,0)
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