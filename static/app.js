require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/support/Field",
    "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer",
    "esri/widgets/Sketch/SketchViewModel",
    "esri/Graphic",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "dgrid/OnDemandGrid",
    "dgrid/extensions/ColumnHider",
    "dojo/store/Memory",
    "dstore/legacy/StoreAdapter",
    "dgrid/Selection",
    "dojo/request",
    "esri/tasks/support/Query",
    "esri/layers/CSVLayer",
    "esri/widgets/Search"
  ], function (Map, MapView, Field, GraphicsLayer, FeatureLayer, SketchViewModel,
    Graphic, Legend, Expand, OnDemandGrid, ColumnHider, Memory, StoreAdapter, Selection, request, Query, CSVLayer, Search) {
    /*
    request.post("static/data/test.json", {
      handleAs: "json"
    }).then(
      function (response) {
        console.log(typeof (response));
        console.log(1);
      }
    );
  */
  
    let map, view, co_csvLayer, co_view, tra_csvLayer, tra_view, polygonGraphicsLayer, sketchViewModel, highlight, grid;
    let tra_distrcit, co_district;
  
  
    // 共享办公 根据用户的选择 改变颜色代表的属性 
    let co_field_for_color = 0;
    co_field_for_color_select = document.getElementById("co-fieldSelect");
    co_field_for_color_select.addEventListener("change", function () {
      co_field_for_color = event.target.value;
      co_csvLayer.renderer = co_renderer[co_field_for_color];
      // querydis(district).then(displayResults);
    });
  
    co_renderer = [
      //renderer#1 Price
      {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-marker",
          size: 8,
        }, // autocasts as new SimpleMarkerSymbol()
        visualVariables: [{
          type: "color",
          field: "Price", // Carbon storage
          //field: co_field_for_color,
          stops: [{
              value: 600,
              color: "#e3f2fd"
            }, // features with zero carbon
            {
              value: 10000,
              color: "#0d47a1"
            } // features with 8000 carbon
          ]
          // Values between 0-8000 will be assigned a color proportionally along the ramp
        }]
      },
      //renderer#2 Subway_Dis
      {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-marker",
          size: 8
        }, // autocasts as new SimpleMarkerSymbol()
        visualVariables: [{
          type: "color",
          field: "Subway_Dis", // Carbon storage
          //field: co_field_for_color,
          stops: [{
              value: 4.4,
              color: "#e8f5e9"
            }, // features with zero carbon
            {
              value: 4101,
              color: "#1b5e20"
            } // features with 8000 carbon
          ]
          // Values between 0-8000 will be assigned a color proportionally along the ramp
        }]
      }
    ]
  
  
    //add coworking layer
    co_csvLayer = new CSVLayer({
      url: 'static/data/f2.csv',
      title: 'Shared Office',
      copyright: 'shuaizhao',
      popupTemplate: {
        title: "{Office_Nam}",
        content: [{
            type: "text",
            text: "{Address}"
          },
          {
            type: "fields",
            fieldInfos: [{
                fieldName: "Price",
                label: "Price(￥/seat/month)"
              },
              {
                fieldName: "District_old",
                label: "District"
              },
              {
                fieldName: "Address",
                label: "Address"
              },
              {
                fieldName: "Subway_Dis",
                label: "Distance to subway(m)"
              },
              {
                fieldName: "busstation_Count",
                label: "Number of bus stations within 500m"
              },
              {
                fieldName: "bank_Count",
                label: "Number of banks within 500m"
              },
              {
                fieldName: "food_Count",
                label: "Number of restaurants within 500m"
              },
            ]
          }
        ]
      },
      renderer: co_renderer[co_field_for_color],
  
      visible: true
    });
  
  
    // 传统办公 根据用户的选择 改变颜色代表的属性
    let tra_field_for_color = 0;
  
    tra_field_for_color_select = document.getElementById("tra-fieldSelect");
  
    tra_field_for_color_select.addEventListener("change", function () {
      tra_field_for_color = event.target.value;
      tra_csvLayer.renderer = tra_renderer[tra_field_for_color];
      // querydis(district).then(displayResults);
    });
  
    tra_renderer = [
      //price
      { //#renderer:渲染器：添加符号要素
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-marker",
          size: 8
        }, // autocasts as new SimpleMarkerSymbol()
        visualVariables: [
          // {                                                           //#根据"Price"自动变化"simple-marker"的"size"
          //   type: "size",                                                             
          //   field: "Area", // tree canopy diameter
          //   valueUnit: "meter", // values of Width_EW are expressed in feet,meters
          //   valueRepresentation: "diameter" // indicates the value in `field` is a diameter,area
          // },
          {
            type: "color", //#根据"weibo_count"自动变化"simple-marker"的"color""size"
            field: "Price", // Carbon storage
            stops: [{
                value: 2,
                color: "#ffebee"
              }, // features with zero carbon
              {
                value: 35,
                color: "#b71c1c"
              } // features with 8000 carbon
            ]
            // Values between 0-8000 will be assigned a color proportionally along the ramp
          }
        ]
      },
      //area
      { //#renderer:渲染器：添加符号要素
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-marker",
          size: 8
        }, // autocasts as new SimpleMarkerSymbol()
        visualVariables: [{
          type: "color", //#根据"weibo_count"自动变化"simple-marker"的"color""size"
          field: "Area", // Carbon storage
          stops: [{
              value: 20,
              color: "#fffde7"
            }, // features with zero carbon
            {
              value: 4000,
              color: "#f57f17"
            } // features with 8000 carbon
          ]
          // Values between 0-8000 will be assigned a color proportionally along the ramp
        }]
      },
      //Subway_Dis
      { //#renderer:渲染器：添加符号要素
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: {
          type: "simple-marker",
          size: 8
        }, // autocasts as new SimpleMarkerSymbol()
        visualVariables: [{
          type: "color", //#根据"weibo_count"自动变化"simple-marker"的"color""size"
          field: "Subway_Dis", // Carbon storage
          stops: [{
              value: 18,
              color: "#f3e5f5"
            }, // features with zero carbon
            {
              value: 4331,
              color: "#4a148c"
            } // features with 8000 carbon
          ]
          // Values between 0-8000 will be assigned a color proportionally along the ramp
        }]
      }
    ]
  
    tra_csvLayer = new CSVLayer({ //#传统办公
      //Office_Nam,District,cityblock,Address,Area,Price_show,Price,Latitude,Longitude,装修程度,电梯数量,写字楼规模,平均房价,微博签到数,中心区距离,中心区ID,地铁站距离,公交车站数量,高校数量,餐饮数量,企业数量,小区数量,银行数量,购物数量
      //办公名字	匹配用	行政区	区域名	地址	办公面积	办公价格	LAT	LNG	装修程度	电梯数量	写字楼规模	平均房价	微博签到数	中心区距离	中心区ID	地铁站距离	公交车站数量	高校数量	餐饮数量	企业数量	小区数量	银行数量	购物数量
      url: 'static/data/f3.csv',
      title: 'Traditional Office',
      copyright: 'hjy',
      popupTemplate: { //#popupTemplate 添加并设置弹窗
        title: "{Office_Nam}",
        content: [{
            type: "text",
            text: "{Address}"
          },
          {
            type: "fields",
            fieldInfos: [{
                fieldName: "Area",
                label: "Price(m^2)" //最后显示的key的名字
              },
              {
                fieldName: "Price",
                label: "Price(￥/m^2/day)"
              },
              {
                fieldName: "District_old",
                label: "District"
              },
              {
                fieldName: "Address",
                label: "Address"
              },
              {
                fieldName: "Subway_Dis",
                label: "Distance to subway(m)"
              },
              {
                fieldName: "busstation_Count",
                label: "Number of bus stations within 500m"
              },
              {
                fieldName: "bank_Count",
                label: "Number of banks within 500m"
              },
              {
                fieldName: "food_Count",
                label: "Number of restaurants within 500m"
              },
            ]
          }
        ]
      },
      renderer: tra_renderer[tra_field_for_color],
      visible: true
    });
  
  
    var resultsLayer = new GraphicsLayer();
    map = new Map({
      basemap: "topo-vector", //topo-vector
      layers: [co_csvLayer, tra_csvLayer, resultsLayer],
    });
  
    view = new MapView({
      container: "viewDiv",
      map: map,
      center: [116.4, 39.9],
      zoom: 12
    });
  
    //Add Search widget
    var search = new Search({
      view: view
    });
    /*
    //Add the office as a search source
    search.sources.push({
      layer: co_csvLayer,
      searchFields: ["Office_Nam", "Address"],
      displayFields: ["Office_Nam"],
      exactMatch: false,
      outFields: ["Office_Nam"],
      resultGraphicEnabled: true,
      name: "共享办公"
    });
  
    search.sources.push({
      layer: tra_csvLayer,
      searchFields: ["Office_Nam", "Address"],
      displayField: "Office_Nam",
      exactMatch: false,
      outFields: ["Office_Nam"],
      resultGraphicEnabled: true,
      name: "传统办公"
    });
  */
    view.ui.components = [];
    view.ui.add("showDiv", "top-left");
    view.ui.add("shortDiv", "top-right");
    view.ui.add("infoDiv", "top-right");
    view.ui.add("panel2", "top-right");
    // view.ui.add(search, "top-left");
    //view.ui.add("panel2", "top-right");
    //view.ui.add("panel", "top-right");
  
    // view.ui.add(new Legend({ view: view }), "bottom-left");
    const layerListExpand = new Expand({
      expandIconClass: "esri-icon-chart", // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
      // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
      view: view,
      content: document.getElementById("panel"),
    });
    // view.ui.add(new Legend({ view: view }), "bottom-left");
    const linechart = new Expand({
      expandIconClass: "esri-icon-chart", // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
      // expandTooltip: "Expand LayerList", // optional, defaults to "Expand" for English locale
      view: view,
      content: document.getElementById("panel2")
    })
    view.ui.add(layerListExpand, "bottom-left");
  
    const legend = new Expand({
      content: new Legend({
        view: view
      }),
      view: view,
    })
    view.ui.add(legend, "bottom-left");
  
    // view.ui.add("hoverinfo", "top-left");
  
    view.when().then(function () {
      view.whenLayerView(co_csvLayer)
        .then(function (layerView) {
          co_view = layerView;
        });
      view.whenLayerView(tra_csvLayer)
        .then(function (layerView) {
          tra_view = layerView;
        });
    })
  
    //筛选按钮功能
    var infodiv = document.getElementById("infoDiv");
    var panel2 = document.getElementById("panel2");
    var selectbutton = document.getElementById("selecting-button");
    selectbutton.onclick = function (event) {
      if (infodiv.style.display == 'none') {
        infodiv.style.display = 'block'
      } else {
        infodiv.style.display = 'none'
      }
      panel2.style.display = 'none'
    }
    var comparebutton = document.getElementById("comparing-button");
    comparebutton.onclick = function (event) {
      infodiv.style.display = 'none';
      if (panel2.style.display == 'none' || !panel2.style.display) {
        panel2.style.display = 'block'
      } else {
        panel2.style.display = 'none'
      }
    }
  
    //选择显示的layer：click buttons to change the visibility of layer
    //click events for the layer type buttons
    var co_button = document.getElementById("coworking-layer-button");
    var tra_button = document.getElementById("traworking-layer-button");
    co_button.onclick = co_layerChangedClickHandler;
    tra_button.onclick = tra_layerChangedClickHandler;
    //The layer is selected originally. Click to cancel select and click to select again. 
  
    // // click buttons to change div
    // var co_showingdiv=document.getElementById("co-color-showing");
    // var tra_showingdiv=document.getElementById("tra-color-showing");
  
    function co_layerChangedClickHandler(event) {
      if (co_csvLayer.visible == false) {
        co_csvLayer.visible = true;
        co_button.classList.remove('btn-outline-info');
        co_button.classList.add('btn-info');
      } else {
        co_csvLayer.visible = false;
        co_button.classList.remove('btn-info');
        co_button.classList.add('btn-outline-info');
      };
      // if(co_showingdiv.style.display == 'block'){ // not success
      //   co_showingdiv.style.display == 'none';
      // }else{
      //   co_showingdiv.style.display == 'block';
      // };
    }
    tra_botton = document.getElementById("traworking-layer-button")
  
    function tra_layerChangedClickHandler(event) {
      if (tra_csvLayer.visible == false) {
        tra_csvLayer.visible = true;
        tra_button.classList.remove('btn-outline-info');
        tra_button.classList.add('btn-info');
      } else {
        tra_csvLayer.visible = false;
        tra_button.classList.remove('btn-info');
        tra_button.classList.add('btn-outline-info');
      };
      // if(tra_showingdiv.style.display == 'block'){
      //   tra_showingdiv.style.display == 'none';
      // }else{
      //   tra_showingdiv.style.display == 'block';
      // };
    }
  
  
  
    // 选择要过滤的办公类型 select which kind of layer for filtering and change div
    var coworkingselect = document.getElementById("coworking-layer-select");
    var coworkingdiv = document.getElementById("co-office-layer");
    var traworkingselect = document.getElementById("traworking-layer-select");
    var traworkingdiv = document.getElementById("tra-office-layer");
    coworkingselect.addEventListener("click", function () {
      co_csvLayer.visible = true;
      tra_csvLayer.visible = false;
      coworkingselect.classList.remove('btn-outline-info');
      coworkingselect.classList.add('btn-info');
      traworkingselect.classList.remove('btn-info');
      traworkingselect.classList.add('btn-outline-info');
      co_button.classList.remove('btn-outline-info');
      tra_button.classList.remove('btn-info');
      co_button.classList.add('btn-info');
      tra_button.classList.add('btn-outline-info');
      coworkingdiv.style.display = 'block';
      traworkingdiv.style.display = 'none';
      deletebarChart(barchart, subwaychart, areachart,firmchart);
    })
    traworkingselect.addEventListener("click", function () {
      co_csvLayer.visible = false;
      tra_csvLayer.visible = true;
      coworkingselect.classList.remove('btn-info');
      coworkingselect.classList.add('btn-outline-info');
      traworkingselect.classList.remove('btn-outline-info');
      traworkingselect.classList.add('btn-info');    
      tra_button.classList.remove('btn-outline-info');
      co_button.classList.remove('btn-info');
      tra_button.classList.add('btn-info');
      co_button.classList.add('btn-outline-info');    
      traworkingdiv.style.display = 'block';
      coworkingdiv.style.display = 'none';
      deletebarChart(barchart, subwaychart, areachart,firmchart);
    })
  
  
    // //if coworking layer has been selected(select according to the features)
    // // query UI components
    var co_querys = document.getElementById("co-query");
    var co_delete_query = document.getElementById("co-delete-query");
    var co_subwayDistanceSlider = document.getElementById("co-SubwayDis-high");
  
    co_subwayDistanceSlider.addEventListener("input", function () {
      var co_subwayDistance = co_subwayDistanceSlider.value;
      document.getElementById("co-SubwayDis-high-value").innerText = co_subwayDistance;
      // queryCoOffice().then(displayResults);
    });
  
    co_querys.addEventListener("click", function () {
      var co_subwayDistance = co_subwayDistanceSlider.value;
      var co_maxprice = document.getElementById("co-pri-high").value;
      var co_minprice = document.getElementById("co-pri-low").value;
      var co_bus_check = document.getElementById("co-check-bus").checked;
      var co_food_check = document.getElementById("co-check-food").checked;
      var co_bank_check = document.getElementById("co-check-bank").checked;
      var co_district = document.getElementById("co-districtSelect").selectedIndex;
      queryCoOffice(co_minprice, co_maxprice, co_subwayDistance, co_bus_check, co_food_check, co_bank_check, co_district);
    });
  
    co_delete_query.addEventListener("click", function () {
      co_view.filter = null;
    });
  
    function queryCoOffice(value1, value2, value5, value6, value7, value8, value9) {
      if (value6) {
        value6 = 1;
      } else {
        value6 = 0;
      };
      if (value7) {
        value7 = 1;
      } else {
        value7 = 0;
      };
      if (value8) {
        value8 = 1;
      } else {
        value8 = 0;
      };
      if (value9 > 0) {
        var query = {
          where: "Price > " + value1 + " AND Price < " + value2 + " AND Subway_Dis < " + value5 + " AND busstation_Count >= " + value6 +
            " AND food_Count >= " + value7 + " AND bank_Count >= " + value8 + " AND District = " + value9
        };
      } else {
        var query = {
          where: "Price > " + value1 + " AND Price < " + value2 + " AND Subway_Dis < " + value5 + " AND busstation_Count >= " + value6 +
            " AND food_Count >= " + value7 + " AND bank_Count >= " + value8
        };
      };
      co_view.filter = query;
    }
  
    // //if tra working layer has been selected(select according to the features)
    // // query UI components
    var tra_querys = document.getElementById("tra-query");
    var tra_delete_query = document.getElementById("tra-delete-query");
    var tra_subwayDistanceSlider = document.getElementById("tra-SubwayDis-high");
    // var tra_distrcit_select=document.getElementById("tra-districtSelect");
  
    // let tra_district=0;
    // tra_distrcit_select.addEventListener("change", function() {
    //   tra_district = event.target.value;
    //   // querydis(district).then(displayResults);
    // });
  
  
    // check.onclick=function(){
    //     return true;
    // }
  
    tra_subwayDistanceSlider.addEventListener("input", function () {
      var tra_subwayDistance = tra_subwayDistanceSlider.value;
      document.getElementById("tra-SubwayDis-high-value").innerText = tra_subwayDistance;
      // querytraOffice().then(displayResults);
    });
  
    tra_querys.addEventListener("click", function () {
      var tra_subwayDistance = tra_subwayDistanceSlider.value;
      var tra_maxprice = document.getElementById("tra-pri-high").value;
      var tra_minprice = document.getElementById("tra-pri-low").value;
      var tra_bus_check = document.getElementById("tra-check-bus").checked;
      var tra_food_check = document.getElementById("tra-check-food").checked;
      var tra_bank_check = document.getElementById("tra-check-bank").checked;
      var tra_district = document.getElementById("tra-districtSelect").selectedIndex;
      var tra_arealow = document.getElementById("tra-area-low").value;
      var tra_areahigh = document.getElementById("tra-area-high").value;
      querytraOffice(tra_minprice, tra_maxprice, tra_subwayDistance, tra_bus_check, tra_food_check, tra_bank_check, tra_district);
    });
  
    tra_delete_query.addEventListener("click", function () {
      tra_view.filter = null;
    });
  
    function querytraOffice(value1, value2, value5, value6, value7, value8, value9) {
      if (value6) {
        value6 = 1;
      } else {
        value6 = 0;
      };
      if (value7) {
        value7 = 1;
      } else {
        value7 = 0;
      };
      if (value8) {
        value8 = 1;
      } else {
        value8 = 0;
      };
      if (value9 > 0) {
        var query = {
          where: "Price > " + value1 + " AND Price < " + value2 + " AND Subway_Dis < " + value5 + " AND busstation_Count >= " + value6 +
            " AND food_Count >= " + value7 + " AND bank_Count >= " + value8 + " AND District = " + value9,
        };
      } else {
        var query = {
          where: "Price > " + value1 + " AND Price < " + value2 + " AND Subway_Dis < " + value5 + " AND busstation_Count >= " + value6 +
            " AND food_Count >= " + value7 + " AND bank_Count >= " + value8,
        };
      };
  
      tra_view.filter = query;
    }
  
    function displayResults(results) {
      resultsLayer.removeAll();
      var features = results.features.map(function (graphic) {
        graphic.symbol = {
          type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
          style: "diamond",
          size: 6.5,
          color: "darkorange"
        };
        return graphic;
      });
      var numOffices = features.length;
      document.getElementById("tra-results").innerHTML =
        numOffices + " offices found";
      resultsLayer.addMany(features);
    }
  
    let radarchart, mode = true;
    creatchart();
    creatbarchart()
    creatsubwaychart()
    creatareachart() //传统办公独有
    creatfirmchart() //共享办公独有
    view.on("click", function (event) {
      // Search for graphics at the clicked location. View events can be used
      // as screen locations as they expose an x,y coordinate that conforms
      // to the ScreenPoint definition.
      view.hitTest(event).then(function (response) {
        if (response.results.length) {
          var graphic = response.results.filter(function (result) {
            // check if the graphic belongs to the layer of interest
            return ((result.graphic.layer === co_csvLayer) || (result.graphic.layer === tra_csvLayer));
          })[0].graphic;
          //// var tragraphic = response.results.filter(function (result) {
          // check if the graphic belongs to the layer of interest
          // return (result.graphic.layer === tra_csvLayer);  
          // })[0].graphic;
          // do something with the result graphic
          const attr = graphic.attributes;
          // const traattr = tragraphic.attributes;
  
          //const traattr = tragraphic.attributes;
          const datavalue = [attr.Price, attr.Subway_Dis, attr.busstation_Count, attr.bank_Count, attr.food_Count];
          const datavaluepre = [attr.Pricepre, attr.Subway_Dispre, attr.busstation_Countpre, attr.bank_Countpre, attr.food_Countpre];
          //const traarea=[traattr.Area];
          updateradarChart(radarchart, datavaluepre);
          updatebarChart(barchart, datavalue, attr.Office_Nam);
          updatesubwayChart(subwaychart, datavalue, attr.Office_Nam);
          if (attr.Area) {
            updateareaChart(areachart, attr.Area, attr.Office_Nam);
          }
          if (attr.firm_Count) {
            updatefirmChart(firmchart, attr.firm_Count, attr.Office_Nam);
          }
          /*
          if (mode) {
            console.log(graphic.attributes);
            view.whenLayerView(graphic.layer).then(function (layerView) {
              highlight = layerView.highlight(graphic);
            })
          }*/
        }
      });
    });
    var tt = document.getElementById("drawpicture");
  
    tt.onclick = function () {
      deletebarChart(barchart, subwaychart, areachart,firmchart);
    };
  
    function updateradarChart(chart, dataValues) {
      chart.data.datasets[0].data = dataValues;
      chart.update();
    }
  
    function updatebarChart(chart, dataValues, NAME) {
      a = 0.5;
      r = Math.trunc(Math.random() * 255);
      g = Math.trunc(Math.random() * 255);
      b = Math.trunc(Math.random() * 255);
      c = "rgba(" + r + "," + g + "," + b + "," + a + ")";
      var newdata = {
        label: NAME,
        backgroundColor: c,
        data: [dataValues[0]
  
        ]
      }
      chart.data.datasets.push(newdata);
  
      chart.update();
    }
  
    function updatesubwayChart(chart, dataValues, NAME) {
      a = 0.5;
      r = Math.trunc(Math.random() * 255);
      g = Math.trunc(Math.random() * 255);
      b = Math.trunc(Math.random() * 255);
      c = "rgba(" + r + "," + g + "," + b + "," + a + ")";
      var newdata = {
        label: NAME,
        backgroundColor: c,
        data: [dataValues[1]
  
        ]
      }
      chart.data.datasets.push(newdata);
  
      chart.update();
    }
  
    function updateareaChart(chart, traarea, NAME) {
      a = 0.5;
      r = Math.trunc(Math.random() * 255);
      g = Math.trunc(Math.random() * 255);
      b = Math.trunc(Math.random() * 255);
      c = "rgba(" + r + "," + g + "," + b + "," + a + ")";
      var newdata = {
        label: NAME,
        backgroundColor: c,
        data: [traarea
  
        ]
      }
      chart.data.datasets.push(newdata);
  
      chart.update();
    }
  
    function updatefirmChart(chart, firmcount, NAME) {
      a = 0.5;
      r = Math.trunc(Math.random() * 255);
      g = Math.trunc(Math.random() * 255);
      b = Math.trunc(Math.random() * 255);
      c = "rgba(" + r + "," + g + "," + b + "," + a + ")";
      var newdata = {
        label: NAME,
        backgroundColor: c,
        data: [firmcount
  
        ]
      }
      chart.data.datasets.push(newdata);
  
      chart.update();
    }
  
    function creatchart() {
      const chart = document.getElementById("chart");
      radarchart = new Chart(chart.getContext("2d"), {
        type: "radar",
        data: {
          labels: [
            "Price",
            "Distance to subway",
            "Numbers of bus stations",
            "Numebrs of banks",
            "Numbers of restaurants",
          ],
          datasets: [{
            label: "score",
            "fill": true,
            // "backgroundColor":c,
            "borderColor": 'rgb(75, 192, 192)',
            //"pointBackgroundColor":'rgb(255, 99, 132)',
            "pointBorderColor": "#fff",
            "pointHoverBackgroundColor": "#fff",
            "pointHoverBorderColor": 'rgb(75, 192, 192)',
            data: [0, 10, 15, 14, 30, 20]
          }, ]
        },
        options: {
          responsive: false,
          ticks: {
            beginAtZero: true,
            Steps: 10,
          },
          legend: {
            position: "top"
          },
          title: {
            display: true,
            text: ['Office Information']
          },
          scales: {
            ticks: {
              max: 100,
              min: 0,
              stepSize: 20
            }
  
          }
        }
      });
    }
  
    function creatbarchart() {
      const chart = document.getElementById("bar");
      barchart = new Chart(chart.getContext("2d"), {
        type: 'bar',
        data: {
          labels: ['Price'],
        },
        options: {
          legend: {
            display: true,
            labels: {
              fontSize: 8,
              boxWidth: 12
            }
          },
          title: {
            display: true,
            text: ['Renting Price', 'Shared: ￥/seat/month', 'Traditional: ￥/m^2/day']
          },
          scales: {
            xAxes: [{
              gridLines: {
                color: 'rgba(0, 0, 0, 0)', // 隐藏x轴方向轴线
                zeroLineColor: '#666666' // 设置轴颜色
              },
              barPercentage: 0.2, // 设置柱宽度
              ticks: { // 设置轴文字字号和色值
                fontSize: 12,
                fontColor: '#666666'
              }
            }],
            yAxes: [{
              gridLines: {
                color: 'rgba(0, 0, 0, 0)', // 隐藏要y轴轴线
                zeroLineColor: '#666666'
              },
              ticks: {
                fontSize: 12,
                beginAtZero: true, // y轴数据从0开始展示
                fontColor: '#666666'
              }
            }],
            tooltips: {
              callbacks: {
                label: function (tooptipItem) {
                  return tooptipItem.yLabel + '￥/(m^2*day)';
                }
              }
            }
          }
        }
      });
    }
  
    function creatsubwaychart() {
      const chart = document.getElementById("subway");
      subwaychart = new Chart(chart.getContext("2d"), {
        type: 'bar',
        data: {
          labels: ['Distance to subway']
        },
        options: {
          legend: {
            display: true,
            labels: {
              fontSize: 8,
              boxWidth: 12
            }
          },
          title: {
            display: true,
            text: "Distance to the nearest subway(m)"
          },
          scales: {
            xAxes: [{
              gridLines: {
                color: 'rgba(0, 0, 0, 0)', // 隐藏x轴方向轴线
                zeroLineColor: '#666666' // 设置轴颜色
              },
              barPercentage: 0.2, // 设置柱宽度
              ticks: { // 设置轴文字字号和色值
                fontSize: 12,
                fontColor: '#666666'
              }
            }],
            yAxes: [{
              gridLines: {
                color: 'rgba(0, 0, 0, 0)', // 隐藏要y轴轴线
                zeroLineColor: '#666666'
              },
              ticks: {
                fontSize: 12,
                beginAtZero: true, // y轴数据从0开始展示
                fontColor: '#666666'
              },
              scaleLabel: {
                display: true,
                labelString: '米'
              }
            }],
            tooltips: {
              callbacks: {
                label: function (tooptipItem) {
                  return tooptipItem.yLabel + 'm';
                }
              }
            }
          }
        }
      });
    }
  
    function creatareachart() {
      const chart = document.getElementById("tra");
      areachart = new Chart(chart.getContext("2d"), {
        type: 'bar',
        data: {
          labels: ['Area']
        },
        options: {
          legend: {
            display: true,
            labels: {
              fontSize: 8,
              boxWidth: 12
            }
          },
          title: {
            display: true,
            text: "Office Area(m^2)"
          },
          scales: {
            xAxes: [{
              gridLines: {
                color: 'rgba(0, 0, 0, 0)', // 隐藏x轴方向轴线
                zeroLineColor: '#666666' // 设置轴颜色
              },
              barPercentage: 0.2, // 设置柱宽度
              ticks: { // 设置轴文字字号和色值
                fontSize: 12,
                fontColor: '#666666'
              }
            }],
            yAxes: [{
              gridLines: {
                color: 'rgba(0, 0, 0, 0)', // 隐藏要y轴轴线
                zeroLineColor: '#666666'
              },
              ticks: {
                fontSize: 12,
                beginAtZero: true, // y轴数据从0开始展示
                fontColor: '#666666',
              },
              scaleLabel: {
                display: true,
                labelString: '平方米'
              }
  
            }],
            tooltips: {
              callbacks: {
                label: function (tooptipItem) {
                  return tooptipItem.yLabel + 'm^2';
                }
              }
            }
          }
        }
      });
    }
  
    function creatfirmchart() {
      const chart = document.getElementById("firm");
      firmchart = new Chart(chart.getContext("2d"), {
        type: 'bar',
        data: {
          labels: ['Number of firms']
        },
        options: {
          legend: {
            display: true,
            labels: {
              fontSize: 8,
              boxWidth: 12
            }
          },
          title: {
            display: true,
            text: "Number of firms within 500m of coworking offices"
          },
          scales: {
            xAxes: [{
              gridLines: {
                color: 'rgba(0, 0, 0, 0)', // 隐藏x轴方向轴线
                zeroLineColor: '#666666' // 设置轴颜色
              },
              barPercentage: 0.2, // 设置柱宽度
              ticks: { // 设置轴文字字号和色值
                fontSize: 12,
                fontColor: '#666666'
              }
            }],
            yAxes: [{
              gridLines: {
                color: 'rgba(0, 0, 0, 0)', // 隐藏要y轴轴线
                zeroLineColor: '#666666'
              },
  
              ticks: {
                fontSize: 12,
                beginAtZero: true, // y轴数据从0开始展示
                fontColor: '#666666'
              },
              scaleLabel: {
                display: true,
                labelString: ''
              }
            }],
            tooltips: {
              callbacks: {
                label: function (tooptipItem) {
                  return tooptipItem.yLabel + '';
                }
              }
            }
          }
        }
      });
    }
  
    function deletebarChart(chart1, chart2, chart3,chart4) {
      chart1.data.datasets.splice(0, chart1.data.datasets.length)
      chart1.update()
      chart2.data.datasets.splice(0, chart2.data.datasets.length)
      chart2.update()
      //creatchart()
      chart3.data.datasets.splice(0, chart3.data.datasets.length)
      chart3.update()
      chart4.data.datasets.splice(0, chart4.data.datasets.length)
      chart4.update()
    }
  });