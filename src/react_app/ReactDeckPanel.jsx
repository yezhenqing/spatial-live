import { useVueHooksInReact } from '@/utils/vuePiniaCrossingProvider';
import DeckGL, {COORDINATE_SYSTEM} from 'deck.gl';
import {OrthographicView, OrbitView} from 'deck.gl';
import {BitmapLayer, IconLayer} from 'deck.gl';
import { createLayerInstance } from '@/utils/layerGenerator'
import { useRef, useEffect, useState } from 'react';
import ICON_ATLAS from '@/assets/icon-atlas.png'
import { concat as _lod_concat } from "lodash-es"
import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

const VIEWPORTDICT = {
  'Ortho': new OrthographicView({
      id: 'ortho',
  }),

  'Orbit': new OrbitView({
      id: 'orbit',
      //orbitAxis: 'Y',
      //orthographic: false,
  }),
};

// the order of layer creation is matter for gene-heatmap rendering
function assembleLayersInReact(p_store) {
  let _all_configs = []
  let _gene_configs = []
  for (const key in p_store._layers_config) {
    if (p_store._layers_config.hasOwnProperty(key)) {
      const config = p_store._layers_config[key]
      if(key.startsWith("gene")){
        _gene_configs.push( {"key": key, "config": config, "z-depth": config.z_height} )
      } else{
        _all_configs.push( {"key": key, "config": config, "z-depth": config.z_height} )
      }
    }
  }
  _gene_configs = _gene_configs.sort((a, b) => a['z-depth'] - b['z-depth']);
  _all_configs = _all_configs.concat(_gene_configs)
  let _layers = []
  _all_configs.map( (co) => {
    const _layer = createLayerInstance(co.config, p_store.csvdata, p_store.imgdata, p_store.jsondata, p_store.viewmode)
    if(_layer){ _layers.push(_layer) }
  })
  return _layers
}

/*
function assembleLayersInReact(p_store) {
  let _layers = []
  for (const key in p_store._layers_config) {
    if (p_store._layers_config.hasOwnProperty(key)) {
      const config = p_store._layers_config[key]
      const _layer = createLayerInstance(config, p_store.csvdata, p_store.imgdata, p_store.jsondata, p_store.viewmode)
      if(_layer){ _layers.push(_layer) }
    }
  }
  _layers.sort().reverse()
  return _layers
}
*/

let DYNAMIC_LAYER_DICT = {}

export default function ReactDeckPanel(props) {

  const { appstore } = useVueHooksInReact()
  const refDeckgl = useRef()

  //useEffect( () => {
  //  console.log("Effect layers in store:", appstore._layers_config)
  //}, [])

  //image parameters
  const IMG_WIDTH = appstore.imgdata.width
  const IMG_HEIGHT = appstore.imgdata.height

  const zoom_level = - Math.floor(Math.log2(Math.max(IMG_WIDTH, IMG_HEIGHT) / 500.0))

  const INITIAL_VIEW_STATE = {
    target: [IMG_WIDTH/2, IMG_HEIGHT/2, 0],
    //target: [0, 0, 0],
    //zoom: -5,
    zoom: zoom_level,
    pitch: 10,
    bearing: 10,
  };

  const tissueimg_layer = new BitmapLayer({
    id: "tissueimg_layer",
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    image: appstore.imgdata,
    opacity: appstore.imgopacity,
    bounds: [0, 0, IMG_WIDTH , IMG_HEIGHT],
  });

  const ICON_Data = [
    { "iconloc": "origin",
      "coordinates": [0, 0]
    },
    { "iconloc": "terminal",
      "coordinates": [IMG_WIDTH, IMG_HEIGHT]
    },
  ]

  const icon_layer = new IconLayer({
    id: "icon-layer",
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    data: ICON_Data,
    getColor: d => d?.iconloc==='origin' ? [50,205,50] : [255, 68, 51],
    getIcon: d => 'marker',
    getPosition: d => d.coordinates,
    getSize: d => 3,
    iconAtlas: ICON_ATLAS,
    iconMapping: {
      marker: {
        x: 0,
        y: 0,
        width: 128,
        height: 128,
        anchorY: 128,
        mask: true
      }
    },
    sizeScale: 5,
    pickable: true,
  });

  const _storelayers = assembleLayersInReact(appstore)

  const layers = [
    tissueimg_layer,
    icon_layer,
    ..._storelayers
  ];

  const views = [
    VIEWPORTDICT[appstore.viewmode]
  ]

  const spatialToottip = (obj) => {
    let tipinfo = undefined
    if(obj) {
      if("type" in obj) {
        tipinfo = obj?.properties?.id
      } else if("iconloc" in obj) {
        tipinfo = obj.iconloc + '(' + obj?.coordinates + ')'
      } else {
        tipinfo = obj['id:spot']
      }
    }
    return tipinfo
  }

  const imgname = appstore.imgname;

  const downloadImg = () =>{
    const deck = refDeckgl.current.deck;
    deck.redraw(true);
    const base64Image = deck?.canvas?.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = base64Image;
    a.download = imgname;
    a.click();
  }

  return(
    <>
      <DeckGL style={{ position: 'relative' }}
        ref={refDeckgl}
        views={views}
        layers={layers}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        getTooltip ={ ({object}) => spatialToottip(object) }
      >
        <h3>{appstore.sampleId + '->' + appstore.active_config?.id}</h3>
        <button onClick={downloadImg}>Export Image</button>
      </DeckGL>
    </>
  )
}
