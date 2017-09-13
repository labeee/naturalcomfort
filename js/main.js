	function main() {
		var validar=[];
		var outlog="";
        var ConstrucaoInputs = [];
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
		ConstrucaoInputs["tipo"] = $('#tipo').val(); // escritorio ou escola
        ConstrucaoInputs["windAlpha"] = parseFloat($('#windAlpha').val());
        ConstrucaoInputs["averageShelter"] = parseFloat($('#averageShelter').val());
        ConstrucaoInputs["windowMaxOpenFrac"] = parseFloat($('#windowMaxOpenFrac').val());
        ConstrucaoInputs["NVW_WWR"] = 0;
        ConstrucaoInputs["PW_width2height"] = parseFloat($('#PW_width2height').val());
        ConstrucaoInputs["PW_Cd"] = 0.4;
        ConstrucaoInputs["interiorELAperLen"] = 0.11;
        ConstrucaoInputs["ceilFanAirSpeedDelta"] = parseFloat($('#ceilFanAirSpeedDelta').val());
		if (ConstrucaoInputs["tipo"]=="escritorio"){
			ConstrucaoInputs["roomELPD"] = 25;
			ConstrucaoInputs["publicELPD"] = 15;
			ConstrucaoInputs["occDensity"] = 0.1;
			ConstrucaoInputs["dayStart"] = 8;
			ConstrucaoInputs["dayEnd"] = 18;
		}
		if (ConstrucaoInputs["tipo"]=="escola"){
			ConstrucaoInputs["roomELPD"] = 23.8;
			ConstrucaoInputs["publicELPD"] = 14.1;
			ConstrucaoInputs["occDensity"] = 0.667;
			ConstrucaoInputs["dayStart"] = 9;
			ConstrucaoInputs["dayEnd"] = 17;
		}
		delete(ConstrucaoInputs["tipo"])
        var buscacidade = document.getElementById("cidades").value;
        //var CidadeInput = (cidades[buscacidade]);
		var CidadeInput;
		for (var i in cidades){
			if (cidades[i]["cidade"]==buscacidade){
				CidadeInput=cidades[i];
			};
		};
		
        var input = Object.assign({}, ConstrucaoInputs, CidadeInput);
		var ts = defineTermStats();
		for (i in ConstrucaoInputs){
			if (ConstrucaoInputs[i]>=ts[i][2] && ConstrucaoInputs[i]<=ts[i][3]){
				validar.push(0);
			} else {
				validar.push(1);
				//alert(i+" deve ser maior que "+(ts[i][2]).toString()+" e menor que "+(ts[i][3]).toString())
				outlog=outlog+"<li>"+i+" deve ser maior que "+(ts[i][2]).toString()+" e menor que "+(ts[i][3]).toString()+"</li>";
			}
		}
		
		delete input['cidade'];
		delete input['latitude'];
		delete input['longitude'];
		
		var geralesquerda="<div id='windowOUTLOG' class='modal modal-wide fade'><div class='modal-dialog'><div class='modal-content'><div class='modal-header'><button type='button' class='close' data-dismiss='modal' aria-hidden='true'>×</button><h4 class='modal-title'>CONSOLE</h4></div><div class='modal-body'><ul id='outlog' class='list-inline'>";
		
		var geraldireita="</ul></div><div class='modal-footer'><button type='button' class='btn btn-default' data-dismiss='modal'>Fechar</button></div></div></div></div>";
		
		if (Math.max.apply(null, validar)==0 && Math.min.apply(null, validar)==0){
			var resultado = 100*makePrediction(input).toFixed(2);
			//alert("EHF = "+resultado+"%");
			outlog="EHF = "+resultado+"%"
			document.getElementById("outlog").innerHTML=geralesquerda+outlog+geraldireita
		} else {
			document.getElementById("outlog").innerHTML=geralesquerda+outlog+geraldireita
		}
    }