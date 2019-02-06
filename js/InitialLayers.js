var initialLayers = {
    "https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx#Catastro": {
        type: "ImageWMS",
        url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
        id: 'Catastro',
        title: 'Catastro',
        params: {
            VERSION: "1.1.1",
            PROJECTION: "EPSG:23030"
        }
    },
    "http://www.ign.es/wms-inspire/ign-base": {
        type: "ImageWMS",
        url: 'http://www.ign.es/wms-inspire/ign-base',
        id: 'IGNBaseTodo',
        title: 'Cartociudad - callejero',
        params: {
            VERSION: "1.3.0",
            PROJECTION: "EPSG:23030"
        }
    },
    "http://wms.magrama.es/sig/Alimentacion/CDFrutas/wms.aspx#PF.ProductionSite": {
        type: "ImageWMS",
        url: "http://wms.magrama.es/sig/Alimentacion/CDFrutas/wms.aspx",
        id: "PF.ProductionSite",
        title: "Zonas de Calidad Diferenciada: Frutas",
        params: {
            VERSION: "1.3.0",
            PROJECTION: "EPSG:23030"
        }
    }
};
