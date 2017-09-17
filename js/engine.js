    function svmPredict(Xsc) {
        
        var b = -2.0728;
        var u = 0;
        for (var i in vectors){
            u+=addVectorContribution(Xsc,vectors[i],alphas[i]);       
        };
        
        return (u-b);
    }


    function addVectorContribution(x1,x2,alpha) {
        
        var gamma = 0.003992;
        
        var sSum=[];
        for (var i in x1){
            sSum.push(Math.pow((x1[i]-x2[i]),2));
        };
        var s = sSum.reduce(function(a, b) { return a + b; }, 0);
        
        return (alpha*Math.exp(-gamma*s));
    }


    function unLogistic(x) {

        var eps=0.01;
        return (Math.max(0,Math.min(1,((1+eps)*Math.exp(x)-eps)/(Math.exp(x)+1))));
    }


    function scaleTerms(terms){
        
        var ts = defineTermStats();
        var Xsc = [];
        var termKeys = ['radDirNorm','radDiffHoriz','CDD18','elevation','floorArea','ARsym','floorHeight','Nfloors','WWR','shadingAngle','extWallAbs','extWallU','extWallCT','roofAbs','roofU','roofCT','SHGC','windowU','roomELPD','publicELPD','occDensity','dayStart','dayEnd','PW_Cd','ceilFanAirSpeedDelta','windSpeedRef','stairFracFPA','NVW_WWR','windowMaxOpenFrac','interiorELAperLen','Tout','CDD25','ToutDailyVar','ToutAnnualVar','bldgLength','bldgDepth','bldgHeight','roomSize','perimLen','wallArea','envArea','volume','winArea','opqWallArea','primaryWinArea','nightVentWinArea','roof2env','env2vol','wall2floor',  'window2floor','PW_width2height','lnFloorArea','lnWWR'];
        
        for ( var i in termKeys) {
            var x = terms[termKeys[i]];
            var y = ts[termKeys[i]][0];
            var z = ts[termKeys[i]][1];
            if(x != undefined) {
                Xsc.push((terms[termKeys[i]]-ts[termKeys[i]][0])/ts[termKeys[i]][1]); // subtract mean and divide by SD 
            }
        };
        return (Xsc);    
    }


    function addCompositeTerms(numericInput){
        var terms = numericInput;
        terms['floorArea'] = terms['bldgDepth']*terms['bldgLength'];
        terms['ARsym'] = Math.max(terms['bldgDepth'],terms['bldgLength'])/Math.min(terms['bldgDepth'],terms['bldgLength']);      
        
        if (terms['ARsym'] > 4){
			outlog=outlog+"<li style='color: #000000'>"+'Building aspect ratio is ' + (terms['ARsym']).toString() + ', porém não deveria exceder a 4'+"</li>"
            validate = 1;
        }
        
        terms['bldgHeight'] = terms['Nfloors']*terms['floorHeight'];
        
        
        if (terms['bldgHeight'] > 16){
			outlog=outlog+"<li style='color: #000000'>"+'A altura do edifício é ' + (terms['bldgHeight']).toString() + ', porém não deveria exceder a 16 m'+"</li>"
            validate = 1;
        }
        
        
        terms['perimLen'] = 2*(terms['bldgDepth']+terms['bldgLength']);
        terms['wallArea'] = terms['perimLen']*terms['bldgHeight'];
        terms['envArea'] = terms['wallArea']+terms['floorArea'];
        terms['volume'] = terms['floorArea']*terms['bldgHeight'];
        terms['winArea'] = terms['WWR']*terms['wallArea'];  
        terms['opqWallArea'] = terms['wallArea'] - terms['winArea'];
        terms['nightVentWinArea'] = terms['NVW_WWR']*terms['wallArea'];
        terms['primaryWinArea'] = terms['winArea']-terms['nightVentWinArea'];
        terms['roof2env'] = terms['floorArea']/terms['envArea'];
        terms['env2vol'] = terms['envArea']/terms['volume'];
        terms['wall2floor'] = terms['wallArea']/terms['Nfloors']/terms['floorArea'];
        terms['window2floor'] = terms['winArea']/terms['Nfloors']/terms['floorArea'];
        terms['lnFloorArea'] = Math.log(terms['floorArea']);
        terms['lnWWR'] = Math.log(terms['WWR']);
        windFactor = ((270/10)**0.14)*Math.pow((terms['bldgHeight']/(211.21*Math.log(terms['windAlpha'])+691.38)),terms['windAlpha']);
        terms['windSpeedRef'] = terms['windSpeedMet']*windFactor*terms['averageShelter'];
        delete terms['windSpeedMet'];
        delete terms['windAlpha'];
        delete terms['averageShelter'];
       
        return (terms);
           
    }


    function errorCheckInputAndAddDefaults(textInput){
          
        var numericInput = {};
        var ts = defineTermStats();

        for (key in textInput){
            if (textInput[key] == 'd' || textInput[key] == 'def' || textInput[key] == 'default'){
                numericInput[key] = ts[key][4]; // fifth entry is default 
            }   
            
            else {
                numericInput[key] = Number(textInput[key]);
            }
        
            if (numericInput[key] < ts[key][2]){
				outlog=outlog+"<li style='color: #000000'>"+key + ' deve ser maior que ' + (ts[key][2]).toString()+"</li>"
                validate = 1;
            }
            
            if (numericInput[key] > ts[key][3]){
                outlog=outlog+"<li style='color: #000000'>"+key + ' deve ser menor que ' + (ts[key][3]).toString()+"</li>"
                validate = 1;
            }
        }        
            
        if (numericInput['stairFracFPA'] > 0 && numericInput['Nfloors'] == 1){
			outlog=outlog+"<li style='color: #000000'>"+'stairFracFPA deve ser 0 edificações com Nfloor igual a 1'+"</li>"
            validate = 1;
        }
        
        return (numericInput);
    }


    function defineTermStats(){
        
        var termStats = {};
        termStats['radDirNorm'] =           [109.0984325,    37.45559671,    40,    200,     110];
        termStats['radDiffHoriz'] =         [96.96266615,    7.299151794,    70,    130,     100];
        termStats['Tout'] =                 [23.20605373,    3.281623105,    10,    30,      23];
        termStats['CDD18'] =                [2106.925172,    904.1588487,    0,    3800,    2100];
        termStats['CDD25'] =                [444.3361844,    292.2801603,    0,    1600,    440];
        termStats['ToutDailyVar'] =         [9.154619720,    1.928255447,    3,    15,      9.2];
        termStats['ToutAnnualVar'] =        [11.94386037,    5.914384242,    3,    28,      11.9];
        termStats['elevation'] =            [353.9921875,    369.4811417,    0,    2000,    350]; 
        termStats['bldgLength'] =           [68.11631408,    41.97595823,    13,    200,     50];
        termStats['bldgDepth'] =            [26.56395709,    12.21595855,    8,    50,      30];
        termStats['floorHeight'] =          [3.500301777,    0.433026546,    2.75,    4.25,    3.5];
        termStats['Nfloors'] =              [2.415934245,    1.183226620,    1,    5,       1];
        termStats['roomSize'] =             [108.2682072,    75.24367233,    9,    400,     25];
        termStats['stairFracFPA'] =         [0.022863438,    0.028087528,    0,    0.28,    0];
        termStats['WWR'] =                  [0.242252780,    0.163273223,    0.05,    0.7,     0.25];
        termStats['shadingAngle'] =         [18.63476401,    14.57977048,    0,    45,      0];
        termStats['extWallAbs'] =           [0.497604452,    0.173615665,    0.2,    0.8,     0.5];
        termStats['extWallU'] =             [1.820860741,    1.241584455,    0.1,    5,       1.8];
        termStats['extWallCT'] =            [269.8447305,    132.7642459,    40,    500,     270];
        termStats['roofAbs'] =              [0.499843630,    0.173784543,    0.2,    0.8,     0.5];
        termStats['roofU'] =                [1.819626496,    1.241074747,    0.1,    5,       1.8];
        termStats['roofCT'] =               [204.6064791,    112.5870179,    10,    400,     200];
        termStats['SHGC'] =                 [0.499846227,    0.173731777,    0.2,    0.8,     0.5];
        termStats['windowU'] =              [3.501677277,    1.444018760,    1,    6,       3.5];
        termStats['roomELPD'] =             [13.00584977,    6.933381828,    1,    25,      13];
        termStats['publicELPD'] =           [8.014078145,    4.044116405,    1,    15,      8];
        termStats['occDensity'] =           [0.505671861,    0.285452449,    0.01,    1,       0.35];
        termStats['dayStart'] =             [7.992229562,    1.153135536,    6,    10,      8];
        termStats['dayEnd'] =               [18.00343874,    2.309346268,    14,    22,      18];
        termStats['windowMaxOpenFrac'] =    [0.600427553,    0.213228519,    0.2,    1,       0.6];
        termStats['NVW_WWR'] =              [0.018956173,    0.027974901,    0,    0.17,    0];
        termStats['PW_width2height'] =      [5.076587619,    5.448245401,    0.1,    50,      3];
        termStats['PW_Cd'] =                [0.600113098,    0.115484031,    0.4,    0.8,     0.6];
        termStats['interiorELAperLen'] =    [0.024416867,    0.039153404,    0.0001,    0.4,     0.01]; // note: this mean and std recalculated for ref of Cd = 1
        termStats['ceilFanAirSpeedDelta'] = [0.225348366,    0.290534970,    0,    0.9,     0];
        // composite terms below have no default
        termStats['floorArea'] =            [2191.727618,    2167.672737,    100,    10000];
        termStats['ARsym'] =                [2.616686754,    0.834648473,    1,    4];
        termStats['bldgHeight'] =           [8.338028676,    3.915865091,    2.75,    16];
        termStats['perimLen'] =             [189.3605423,    103.4563447,    42,    500];
        termStats['wallArea'] =             [1636.400371,    1288.929314,    123,    7913];
        termStats['envArea'] =              [3828.127989,    3224.626993,    230,    17910];
        termStats['volume'] =               [19244.24233,    22974.29588,    310,    158243];
        termStats['winArea'] =              [395.8065449,    462.7051573,    7,    5150];
        termStats['opqWallArea'] =          [1240.593826,    1033.588278,    43,    7021];
        termStats['primaryWinArea'] =       [364.5391480,    446.0744364,    4.5,    5150];
        termStats['nightVentWinArea'] =     [31.26739692,    64.14710417,    0,    970];
        termStats['roof2env'] =             [0.522072757,    0.152015825,    0.2,    0.9];
        termStats['env2vol'] =              [0.297247841,    0.125450676,    0.1,    0.75];
        termStats['wall2floor'] =           [0.490530770,    0.273927164,    0.12,    1.7];
        termStats['window2floor'] =         [0.118794505,    0.113102541,    0.007,    1];
        termStats['lnFloorArea'] =          [7.193492999,    1.059668730,    4,    10];
        termStats['lnWWR'] =                [-1.647769594,    0.693410761,    3,    0];
        termStats['windSpeedRef'] =         [1.082950022,    0.709307425,    0,    8];
        // add inputs that are not predictors, for input checking and defaults only    
        termStats['windSpeedMet'] =         [0,            0,            0,    50,      2];
        termStats['windAlpha'] =            [0,            0,            0.1,    0.4,     0.22];
        termStats['averageShelter'] =       [0,            0,            0.3,    1,       0.8];
		// apenas para rodar
		termStats['CDD18study'] =           [2106.925172,    904.1588487,    0,    3800,    2100];
        
        return (termStats);
    }


    function makePrediction(textInput){
        
        numericInput = errorCheckInputAndAddDefaults(textInput);
        terms = addCompositeTerms(numericInput);
        Xsc = scaleTerms(terms);
        uhat = svmPredict(Xsc);
		
		CDD18study = textInput["CDD18study"]
		CDD18 = textInput["CDD18"]
		F = (CDD18/365)/(CDD18study/320)
		yhat = unLogistic(uhat)+ (2.2764*10**-4)*(F-1)*CDD18
		if (yhat > 1){
			yhat = 1        
		}
		if (yhat < 0){
			yhat=0
		}
        
        return (yhat); 
    }
	
	function main() {

	outlog="";
    ConstrucaoInputs=[];
	validate = 0;
	
		
        
		ConstrucaoInputs["bldgLength"] = parseFloat($('#bldgLength').val());
        ConstrucaoInputs["bldgDepth"] = parseFloat($('#bldgDepth').val());
        ConstrucaoInputs["floorHeight"] = parseFloat($('#floorHeight').val());
        ConstrucaoInputs["Nfloors"] = parseFloat($('#Nfloors').val());
        ConstrucaoInputs["roomSize"] = parseFloat($('#roomSize').val());
        ConstrucaoInputs["stairFracFPA"] = parseFloat($('#stairFracFPA').val());
        ConstrucaoInputs["WWR"] = parseFloat($('#WWR').val());
        ConstrucaoInputs["shadingAngle"] = parseFloat($('#shadingAngle').val());
        ConstrucaoInputs["extWallAbs"] = parseFloat($('#extWallAbs').val());
        ConstrucaoInputs["extWallU"] = parseFloat($('#extWallU').val());
        ConstrucaoInputs["extWallCT"] = parseFloat($('#extWallCT').val());
        ConstrucaoInputs["roofAbs"] = parseFloat($('#roofAbs').val());
        ConstrucaoInputs["roofU"] = parseFloat($('#roofU').val());
        ConstrucaoInputs["roofCT"] = parseFloat($('#roofCT').val());
        ConstrucaoInputs["SHGC"] = parseFloat($('#SHGC').val());
        ConstrucaoInputs["windowU"] = parseFloat($('#windowU').val());
		ConstrucaoInputs["tipologia"] = $('#tipologia').val(); // escritorio ou escola
        ConstrucaoInputs["windAlpha"] = parseFloat($('#windAlpha').val());
        ConstrucaoInputs["averageShelter"] = parseFloat($('#averageShelter').val());
        ConstrucaoInputs["windowMaxOpenFrac"] = parseFloat($('#windowMaxOpenFrac').val());
        ConstrucaoInputs["NVW_WWR"] = 0;
        ConstrucaoInputs["PW_width2height"] = parseFloat($('#PW_width2height').val());
        ConstrucaoInputs["PW_Cd"] = 0.4;
        ConstrucaoInputs["interiorELAperLen"] = 0.11;
        ConstrucaoInputs["ceilFanAirSpeedDelta"] = parseFloat($('#ceilFanAirSpeedDelta').val());
		if (ConstrucaoInputs["tipologia"]=="escritorio"){
			ConstrucaoInputs["roomELPD"] = 25;
			ConstrucaoInputs["publicELPD"] = 15;
			ConstrucaoInputs["occDensity"] = 0.1;
			ConstrucaoInputs["dayStart"] = 8;
			ConstrucaoInputs["dayEnd"] = 18;
		}
		if (ConstrucaoInputs["tipologia"]=="escola"){
			ConstrucaoInputs["roomELPD"] = 23.8;
			ConstrucaoInputs["publicELPD"] = 14.1;
			ConstrucaoInputs["occDensity"] = 0.667;
			ConstrucaoInputs["dayStart"] = 9;
			ConstrucaoInputs["dayEnd"] = 17;
		}
		delete(ConstrucaoInputs["tipologia"])
			
        var buscacidade = document.getElementById("cidades").value;
		var CidadeInput;
		for (var i in cidades){
			if (cidades[i]["cidade"]==buscacidade){
				CidadeInput=cidades[i];
			};
		};
		
        input = Object.assign({}, ConstrucaoInputs, CidadeInput);

		delete input['cidade'];
		delete input['latitude'];
		delete input['longitude'];		
		
		var JAJAJAJAJA=makePrediction(input).toFixed(2);
		
		geralesquerda="<div id='windowOUTLOG' class='modal modal-wide fade'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>×</button><h4 class='modal-title'>CONSOLE</h4></div><div class='modal-body'><ul id='outlog' class='list-inline'>";
		
		geraldireita="</ul></div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Fechar</button></div></div></div></div>";
	
       
		if (validate==0 && JAJAJAJAJA!="NaN") {
            outlog="EHF = "+100*JAJAJAJAJA+"%"
            document.getElementById("outlog").innerHTML=geralesquerda+outlog+geraldireita                
        }

        if (validate!=0 && JAJAJAJAJA!="NaN") {
			outlog="<center><h5 style='color: #70936c;'><b>AVISOS</b></h5></center>"+outlog
            document.getElementById("outlog").innerHTML=geralesquerda+outlog+geraldireita
        }
        
        if (JAJAJAJAJA=="NaN") { 
            outlog="<center><h5 style='color: #70936c;'><b>CAMPOS NÃO PREENCHIDOS</b></h5></center>"
            if (buscacidade=="") {
                outlog=outlog+"<li style='color: #000000'>"+"localização"+"</li>";
            }
            if ($('#tipologia').val()=="") {
                outlog=outlog+"<li style='color: #000000'>"+"tipologia"+"</li>";
            }            
			for (i in ConstrucaoInputs){
                if((ConstrucaoInputs[i]).toString()=="NaN"){
                    outlog=outlog+"<li style='color: #000000'>"+i+"</li>";
                }    
            }
            document.getElementById("outlog").innerHTML=geralesquerda+outlog+geraldireita                
        }	
    }