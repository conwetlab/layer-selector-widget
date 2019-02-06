/*
 *     Copyright (c) 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *     Copyright (c) 2013 IGN - Instituto Geográfico Nacional
 *     Centro Nacional de Información Geográfica
 *     http://www.ign.es/
 *
 *     This file is part of the GeoWidgets Project,
 *
 *     http://conwet.fi.upm.es/geowidgets
 *
 *     Licensed under the GNU General Public License, Version 3.0 (the
 *     "License"); you may not use this file except in compliance with the
 *     License.
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     under the License is distributed in the hope that it will be useful,
 *     but on an "AS IS" BASIS, WITHOUT ANY WARRANTY OR CONDITION,
 *     either express or implied; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 *     See the GNU General Public License for specific language governing
 *     permissions and limitations under the License.
 *
 *     <http://www.gnu.org/licenses/gpl.txt>.
 *
 */

use("conwet");

conwet.Gadget = Class.create({
    initialize: function() {
        this.init = true;

        this.wmsManager = new conwet.map.WmsManager();

        this.layersData = initialLayers;
        var layersDataPreference = MashupPlatform.widget.getVariable("layersData");

        if (layersDataPreference.get() != "")
            this.layersData = JSON.parse(layersDataPreference.get());

        var addButton = new StyledElements.Button({text:'Add Layers', 'class': 'btn-success btn-small', iconClass: 'icon-plus'});
        addButton.addEventListener("click", function(){
            this.hideAddLayerDialog();
            this.draw();
        }.bind(this));

        addButton.insertInto(document.getElementById("addLayersButtonContainer"));

        this.draw();

        var closeDialog = document.getElementById("close").observe("mousedown", function(){
            this.hideAddLayerDialog();
        }.bind(this));

        var addBaseLayerButton = new StyledElements.Button({text:'Add Base Layers', 'class': 'btn-primary btn-small addButton',iconClass: 'icon-plus'});
        addBaseLayerButton.addEventListener("click",function(){
            this.showAddLayerDialog(true);
        }.bind(this));
        addBaseLayerButton.insertInto(document.getElementById("addBaseLayersButtonContainer"));

        var addOverlayButton = new StyledElements.Button({text:'Add Overlays', 'class': 'btn-primary btn-small addButton', iconClass: 'icon-plus'});
        addOverlayButton.addEventListener("click", function(){
            this.showAddLayerDialog(false);
        }.bind(this));
        addOverlayButton.insertInto(document.getElementById("addOverlaysButtonContainer"));

    },
    saveLayersData: function(){
        MashupPlatform.widget.getVariable("layersData").set(JSON.stringify(this.layersData));
    },
    draw: function() {
        var baseLayersDiv = document.getElementById("baseLayers");
        var overlaysDiv = document.getElementById("overlays");

        baseLayersDiv.innerHTML = "";
        overlaysDiv.innerHTML = "";

        this.addGoogleBaseLayers(baseLayersDiv);
        this.loadSavedLayers();


    },
    sendLayerData: function(layerData) {

        MashupPlatform.wiring.pushEvent("layerInfoOutput", JSON.stringify(layerData));
    },

    createInputRadioButton: function(id, title, callback) {
        var inputDiv = document.createElement("div");
        var inputElement = document.createElement("input");
        var span = document.createElement("span");

        span.innerHTML = title;

        inputElement.id = id;
        inputElement.name = "baseLayer";
        inputElement.type = "radio";
        inputElement.class = "radioButtonElement";

        if (callback != null)
            inputElement.observe("mousedown", callback);

        inputDiv.appendChild(inputElement);
        inputDiv.appendChild(span);
        return inputDiv;
    },

    createInputCheckBox: function(id, title, checkedCallback, uncheckedCallback) {
        var inputDiv = document.createElement("div");
        var inputElement = document.createElement("input");
        var span = document.createElement("span");

        span.innerHTML = title;

        inputElement.id = id;
        inputElement.type = "checkbox";
        inputElement.class = "checkBoxElement";

        if (uncheckedCallback != null && checkedCallback != null){
            inputElement.observe("mousedown", function(){
                if (inputElement.checked){
                    uncheckedCallback();
                }else{
                    checkedCallback();
                }
            });
        }

        inputDiv.appendChild(inputElement);
        inputDiv.appendChild(span);
        return inputDiv;
    },

    addGoogleBaseLayers: function(containerDiv){
        layerData = {
            action: "setBaseLayer",
            data: {id:""}
        }

        var layers = [
            this.createInputRadioButton("WIKIMEDIA", "Wikimedia", function () {
                layerData.data.id = "WIKIMEDIA";
                this.sendLayerData(layerData);
            }.bind(this)),
            this.createInputRadioButton("CARTODB_LIGHT", "CartoDB Light", function () {
                layerData.data.id = "CARTODB_LIGHT";
                this.sendLayerData(layerData);
            }.bind(this)),
            this.createInputRadioButton("OSM", "Open Street Map", function () {
                layerData.data.id = "OSM";
                this.sendLayerData(layerData);
            }.bind(this)),
        ];

        layers.forEach((radiobutton) => {
            containerDiv.appendChild(radiobutton);
        });
    },
    createBaseLayerInput: function(layerData, containerDiv){
        var title = layerData.name + " (" + layerData.projection + ")";
        var baseLayerInput = this.createInputRadioButton(layerData.id, title, function(){
            delete layerData.id;
            var sendInfo = {
                action: "setBaseLayer",
                data: layerData
            }

            this.sendLayerData(sendInfo);

        }.bind(this));

        containerDiv.appendChild(baseLayerInput);
    },

    createOverlayInput: function(layerData, containerDiv){
        var overlayInput = this.createInputCheckBox(layerData.id, layerData.title != null ? layerData.title : layerData.name,
            function(){
                var sendInfo = {
                    action: "addLayer",
                    data: layerData
                }

                this.sendLayerData(sendInfo);

            }.bind(this),
            function(){
                var sendInfo = {
                    action: "removeLayer",
                    data: {id: layerData.id}
                }

                this.sendLayerData(sendInfo);

            }.bind(this)

        );

        containerDiv.appendChild(overlayInput);
    },

    loadSavedLayers: function(){
         var baseLayersDiv = document.getElementById("baseLayers");
         var overlaysDiv =  document.getElementById("overlays")

        for(var index in this.layersData){
            var layerData = this.layersData[index];
            if (layerData.isBaseLayer){//id, title, callback
                this.createBaseLayerInput(layerData, baseLayersDiv);
            }else{
                this.createOverlayInput(layerData, overlaysDiv)
            }
        }
    },

    showAddLayerDialog: function(isBaseLayer){
        var layerDialog = document.getElementById("addLayerContainer");
        layerDialog.style.display = 'block';

        var shadow = document.getElementById("shadow");
        shadow.style.display = 'block';

        var addLayersSelector = document.getElementById("addLayersSelector");
        addLayersSelector.innerHTML="";
        document.getElementById("addLayersButtonContainer").style.display="none";

        var getLayersButton = document.getElementById("getLayers");
        getLayersButton.onclick = function(){
            addLayersSelector.innerHTML="";
            document.getElementById("addLayersButtonContainer").style.display="none";
            var url = document.getElementById("urlInput").value;
            this.sendGetCapabilities(url, "wms", isBaseLayer);
        }.bind(this);
    },
    hideAddLayerDialog: function(){
        var layerDialog = document.getElementById("addLayerContainer");
        layerDialog.style.display = 'none';
        var shadow = document.getElementById("shadow");
        shadow.style.display = 'none';
    },
    drawLayersToSelect: function(baseURL, type, isBaseLayer){

        var service = this.wmsManager.getService(baseURL);
        document.getElementById("addLayersButtonContainer").style.display="block";

        var layers = service.getLayers();

        for (var i = 0; i < layers.length; i++) {
            if (layers[i].layer.name != null)
                this.createAddLayerDiv(layers[i], isBaseLayer, this.layersData, baseURL, type);
        }

    },
    createAddLayerDiv: function(layer, isBaseLayer, layersToAdd, baseURL, type){
        var addLayerElementDiv = document.createElement("div");
        baseURL = baseURL.split("?")[0];
        var layerData = {
            id: baseURL + "_"+ layer.layer.name,
            url: baseURL,
            name: layer.layer.name,
            version: "1.3.0",
            service: type,
            isBaseLayer: isBaseLayer,
            projection: layer.projections[0]
        }

        layerData.id = isBaseLayer ? layerData.id +"_bl" : layerData.id;
        var checkBoxElement = this.createInputCheckBox(null, layerData.name,
            function(){
                layersToAdd[layerData.id] = layerData;
            },
            function(){
                delete layersToAdd[layerData.id];
            }
        );

        addLayerElementDiv.appendChild(checkBoxElement);
        if (isBaseLayer){
            var projSelect = new StyledElements.StyledSelect();
            var projections = [];
            var validProjections = ["EPSG:4258", "EPSG:900913", "EPSG:4326", "EPSG:4230", "EPSG:3857", "EPSG:23030", "EPSG:25830", "EPSG:32630"];

            for (var i=0; i < layer.projections.length; i++){
                if (validProjections.indexOf(layer.projections[i]) != -1)
                    projections.push({label: layer.projections[i], value: layer.projections[i]});
            }
            projSelect.addEntries(projections);

            //To get the first valid proj and not EPSG:0
            var selectedProj = projSelect.getValue();
            layerData.projection = selectedProj;

            projSelect.addEventListener('change', function(){
                var selectedProj = projSelect.getValue();
                layerData.projection = selectedProj;
                if (layersToAdd[layerData.id]){
                    layersToAdd[layerData.id].proj=selectedProj;
                }

            });

            projSelect.insertInto(addLayerElementDiv);
            checkBoxElement.className = "baseLayerSelect";
            addLayerElementDiv.className = "addBaseLayerDiv";
        }

        document.getElementById("addLayersSelector").appendChild(addLayerElementDiv);

    },

    sendGetCapabilities: function(baseURL, type, isBaseLayer) {

        if (baseURL.length == 0) {
            return;
        }

        if (baseURL.indexOf('?') == -1) {
            baseURL = baseURL + '?';
        } else {
            if (baseURL.charAt(baseURL.length - 1) == '&')
                baseURL = baseURL.slice(0, -1);
        }

        //this.gadget.showMessage(_("Requesting data from server."), true);
        if (type == "wmts"){
            baseURL += "service=WMTSC&version=1.0.0&request=GetCapabilities";
        }else{
            baseURL += "service=WMS&version=1.3.0&request=GetCapabilities";
        }
        MashupPlatform.http.makeRequest(baseURL, {
            method: 'GET',
            onSuccess: function(response) {
                //this.gadget.hideMessage();
                this.parseGetCapabilities(baseURL, response, type);
                this.drawLayersToSelect(baseURL, type, isBaseLayer);
            }.bind(this),
            onFailure: function() {
                this.showError(_("Server not responding."));
            }.bind(this)
        });
    },
    parseGetCapabilities: function(baseURL, ajaxResponse, type) {
        var xml;
        if (ajaxResponse.responseXML == null) {
            var text = ajaxResponse.responseText;
            text = text.replace(/<!--.*?-->/g, '');                         // Helped with ESA server
            text = text.replace(/\[.<!.*?>.\]/g, '');                       // Helped with ESA server
            text = text.replace(/<GetTileService>.*?GetTileService>/g, ''); // Skip NASA DTD error

            if (this.type!="wmts")
                xml = this.parseDOMFromString(text, 'application/xml', true);

            if (xml == null || typeof xml != 'object')
                return this.showError('Incorrect content: check your WMS url');

            if (xml.childNodes.length == 0) {
                try {
                    if (OpenLayers.Ajax.getParseErrorText(xml) != OpenLayers.Ajax.PARSED_OK) {
                        var error = OpenLayers.Ajax.getParseErrorText(xml);
                        return this.showError("Error Parsing GetCapabilties:" + error);
                    }
                } catch (e) {
                    return this.showError(e.description);
                }
            }
        } else {
            xml = ajaxResponse.responseXML;
        }

        if (xml != null) {
            var service;
            try {
                if (type == "wmsc") {
                    service = new conwet.map.WmscService(xml);
                } else if (type == "wmts") {
                    service = new conwet.map.WmtsService(xml);
                } else {
                    service = new conwet.map.WmsService(xml);
                }
                this.wmsManager.addService(baseURL, service);
            } catch (e) {
                this.showError(_('Error: An error happened parsing the service'));
            }
        } else {
            this.showError(_('Incorrect content: check your WMS url'));
        }
    }


});
