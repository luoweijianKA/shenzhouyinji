import React, { useState, useLayoutEffect } from 'react'
import {
  Box,
  FormHelperText,
} from '@mui/material'

type Overlay = 'marker' | 'polyline' | 'polygon' | 'circle' | 'rectangle' | 'ellipse'

interface QQMapProps {
  lat?: string
  lng?: string
  value?: string
  overlay?: Overlay
  disableTool?: boolean
  onChange?: (value: string) => void
}

interface State {
  editor: any
  overlay: Overlay
  paths: any[]
}

export default function QQMap(props: QQMapProps) {
  const { lat, lng, value, overlay, disableTool, onChange } = props
  const { TMap } = (window as any)
  var paths: any[] = []
  if (value && value.length > 0) {
    const p = value.split(",")
    for(var i = 0; i < p.length; i++) {
      if (p[i] && (-90 < Number.parseFloat(p[i]) && Number.parseFloat(p[i]) < 90)) {
        paths.push(new TMap.LatLng(p[i], p[i+1]))
      }
    }
  }
  const [values, setValues] = useState<State>({ 
    editor: undefined, 
    overlay: overlay ?? 'polyline',
    paths
  })
  const latlng = [parseFloat(lat ?? '0'), parseFloat(lng ?? '0')]
  if (!latlng[0] || !(-90 < latlng[0] && latlng[0] < 90)) {
    latlng[0] = 0
  }

  useLayoutEffect(() => {
    if (TMap) {
      var center
      if (lat && lng) {
        const latlng = [parseFloat(lat), parseFloat(lng)]
        if (latlng[0] && (-90 < latlng[0] && latlng[0] < 90)) {
          center = new TMap.LatLng(latlng[0], latlng[1])
        }
      } else if (paths.length > 0) {
        center = paths[0]
      }

      if (!center) {
        // Default center
        center = new TMap.LatLng(39.984120, 116.307484)
      }

      //定义map变量，调用 TMap.Map() 构造函数创建地图
      const map = new TMap.Map(document.getElementById('map-container'), {
        center: center,//设置地图中心点坐标
        zoom: 14,   //设置地图缩放级别
        pitch: 43.5,  //设置俯仰角
        rotation: 45    //设置地图旋转角度
      })

      if (lat && lng) {
        new TMap.MultiMarker({
          id: 'marker-layer',
          map: map,
          geometries: [{
            "id": 'marker',
            "styleId": 'marker',
            "position": center,
          }]
        })
      }

      const editor = new TMap.tools.GeometryEditor({
          // TMap.tools.GeometryEditor 文档地址：https://lbs.qq.com/webApi/javascriptGL/glDoc/glDocEditor
          map: map, // 编辑器绑定的地图对象
          overlayList: [
            // 可编辑图层 文档地址：https://lbs.qq.com/webApi/javascriptGL/glDoc/glDocEditor#4
            {
              overlay: new TMap.MultiMarker({
                map: map,
              }),
              id: 'marker',
            },
            {
              overlay: new TMap.MultiPolyline({
                map: map,
                geometries: values.paths.length > 0 ? [{ "paths": values.paths }] : []
              }),
              id: 'polyline',
            },
            {
              overlay: new TMap.MultiPolygon({
                map: map,
              }),
              id: 'polygon',
            },
            {
              overlay: new TMap.MultiCircle({
                map: map,
              }),
              id: 'circle',
            },
            {
              overlay: new TMap.MultiRectangle({
                map: map,
              }),
              id: 'rectangle',
            },
            {
              overlay: new TMap.MultiEllipse({
                map: map,
              }),
              id: 'ellipse',
            },
          ],
          actionMode: TMap.tools.constants.EDITOR_ACTION.DRAW, // 编辑器的工作模式
          activeOverlayId: values.overlay, // 激活图层
          snappable: true, // 开启吸附
        });

        // 监听绘制结束事件，获取绘制几何图形
      editor.on('draw_complete', (geometry: any) => {
        console.log(geometry)
        let value = ''
        if (onChange) {
          switch(values.overlay) {
            case 'marker': {
              const { lat, lng } = geometry.position
              value = `${lat},${lng}`
              break
            }
            default: {
              value = geometry.paths.map(({ lat, lng }: any) => `${lat},${lng}`).join(',')
              break
            }
          }
          console.log({ value })
          onChange(value)
        }
  //   position.value =  geometry.paths;
      })

      setValues({ ...values, editor })
    }
   }, [TMap])

  const handleOverlay = (overlay: Overlay) => () => {
    const { editor } = values
    if (editor) {
      editor.setActiveOverlay(overlay)
      setValues({ ...values, overlay })
    }
  }

    return (
      <Box>
        <div id="map-container"></div>
        {!(disableTool ?? false) && (
          <React.Fragment>
            <div id="tool-control" >
              {values.overlay === 'marker' && <div className={values.overlay === 'marker' ? 'active' : undefined } id="marker" title="点标记" onClick={handleOverlay('marker')}></div>}
              {values.overlay === 'polyline' && <div className={values.overlay === 'polyline' ? 'active' : undefined } id="polyline" title="折线" onClick={handleOverlay('polyline')}></div>}
              {values.overlay === 'polygon' && <div className={values.overlay === 'polygon' ? 'active' : undefined } id="polygon" title="多边形" onClick={handleOverlay('polygon')}></div>}
              {values.overlay === 'circle' && <div className={values.overlay === 'circle' ? 'active' : undefined } id="circle" title="圆形" onClick={handleOverlay('circle')}></div>}
              {values.overlay === 'rectangle' && <div className={values.overlay === 'rectangle' ? 'active' : undefined } id="rectangle" title="矩形" onClick={handleOverlay('rectangle')}></div>}
              {values.overlay === 'ellipse' && <div className={values.overlay === 'ellipse' ? 'active' : undefined } id="ellipse" title="椭圆" onClick={handleOverlay('ellipse')}></div>}
            </div>
            <FormHelperText id="map-help-text">
            {"绘制：鼠标左键点击及移动即可绘制图形"}
            <br />
            {"结束绘制：鼠标左键双击即可结束绘制折线、多边形、多边形会自动闭合；圆形、椭圆单击即可结束"}
            <br />
            {"中断：绘制过程中按下esc键可中断该过程"}
            </FormHelperText>
          </React.Fragment>
        )}
      </Box>
    )
}