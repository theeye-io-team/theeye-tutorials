#cs ----------------------------------------------------------------------------

 AutoIt Version: 3.3.14.5
 Author:         TheEye

 Script Function:
	Levantar la cotización del Dolar del banco Nacion
	https://www.bna.com.ar/Personas

#ce ----------------------------------------------------------------------------

#CS -----------------------------------------------------

Ruta Librerías Autoit:
	C:\Program Files (x86)\AutoIt3\Include
Librerías Ad-Hoc utilizadas:
	json.au3
  BinaryCall.au3

#CE ----------------------------------------------------

#include <json.au3>
#Include <WinAPIEx.au3>
#include <IE.au3>
#include <array.au3>



$parent = _WinAPI_GetParentProcess(@AutoItPID)
$parent = _WinAPI_GetProcessName($parent)


IF $parent = "AutoIt3Wrapper.exe" or $parent = "SciTE.exe" Then
  	ConsoleWrite(@crlf &  "Running from Autoit Editor")
	#include "env.au3"
Else    
	ConsoleWrite(@crlf &  "Running from TheEye, Console or VSCODE")
EndIf

Local $repoPath = EnvGet("AUTOIT_REPO_PATH") 
ConsoleWrite(@CRLF & "REPO: " & $repoPath)


Local $entorno = EnvGet("RUNNING_ENV")
Local $status = "success"
ConsoleWrite(@CRLF &  "Running Environment: " & $entorno)


; -------------- Do your stuff here ----------------
Local $url = "https://www.bna.com.ar/Personas"

RunWait('taskkill /F /IM "iexplore.exe"')
ToolTip("Ingreso a login " & $Entorno & " - " & $url,0,0)
sleep(2000)


;NO VALIDA ENTRADA
ConsoleWrite($cmdLine[1])
Local $fechaFull = StringSplit($cmdLine[1], "T")
Local $aFecha = StringSplit($fechaFull[1], "-")
Local $fecha = $aFecha[3] & "/" & $aFecha[2] & "/" & $aFecha[1]
ConsoleWrite($fecha)

;Ingreso al sitio

$oIE = _IECreate($url,0,1,0,0)
Sleep(5000)

Local $contador = 0

$oIE = _IEAttach("Banco")
if @error Then
	printStdOutTheEye("No pudo activar IE", "failure", false)
	Exit
EndIf
ConsoleWrite(@CRLF)

$oTable = _IETableGetCollection ($oIE,0)
$aTableData = _IETableWriteToArray ($oTable, True)

Local $billetes
$billetes = fomatTableCotizacionesToJson($aTableData)
;ConsoleWrite(json_encode($billetes))
ConsoleWrite(@CRLF)

$oTable = _IETableGetCollection ($oIE,1)
$aTableData = _IETableWriteToArray ($oTable, True)
Local $divisas
$divisas = fomatTableCotizacionesToJson($aTableData)
;ConsoleWrite(json_encode($divisas))

Local $cotizaciones
Json_Put($cotizaciones, ".billetes", $billetes)
Json_Put($cotizaciones, ".divisas", $divisas)
;ConsoleWrite(Json_encode($cotizaciones))
_IELinkClickByText($oIE, "Ver histórico")
sleep(2000)
Local $oTag = _IEGetObjById($oIE,"fecha")

_IEFormElementSetValue($oTag, $fecha)
$oTag = _IEGetObjById($oIE,"buscarHistorico")
_IEAction($oTag, 'click')


$oTable = _IETableGetCollection ($oIE,2)
$aTableData = _IETableWriteToArray ($oTable, True)
Local $historicoDolar = fomatTableCotizacionesHistoricoToJson($aTableData)

Json_Put($cotizaciones, ".historico_dolar", $historicoDolar)
;_ArrayDisplay($aTableData)

$oTable = _IETableGetCollection ($oIE,3)
$aTableData = _IETableWriteToArray ($oTable, True)
Local $historicoEuro = fomatTableCotizacionesHistoricoToJson($aTableData)

Json_Put($cotizaciones, ".historico_euro", $historicoEuro)
;_ArrayDisplay($aTableData)

_IEQuit($oIE)
; --------------------------------------------------

if @error Then
Local	$myArray = ["Error"]
	$status = "failure"
else
Local $myArray = $cmdLine
Endif

printStdOutTheEye($cotizaciones, $status, True)


; -------------------------------------- Functions ---------------------------------------------
; ----------------------------------------------------------------------------------------------


#CS -------------------------------------------------------------------------------------------
	Function: 
  		printStdOutTheEye ( $errorMessage as String, $status as String, $arrayFormat as Boolean )
  Description: 
  		Prints standard output formatted for TheEye tasks
  Parameters:
  		$errorMessage: String or Array
      	$status: "success" | "failure"
      	$arrayFormat: true if $errorMessage is an Array    
#CE -------------------------------------------------------------------------------------------

Func printStdOutTheEye($errorMessage, $status = "success", $arrayFormat = false)
	if $arrayFormat Then		
		Local $miJson
		json_put($miJson, ".state", $status)
		json_put($miJson, ".data", $errorMessage)
		$line = json_encode($miJson)
	else
		$errorMessage = StringReplace($errorMessage, "\","/")
		$line = '{"state":"' & $status & '", "data":["' & $errorMessage & '"]}'
	EndIF
	ConsoleWrite(@CRLF & $line & @CRLF)	
	FileWrite("statusejecucion.log", $line)
EndFunc

#CS -------------------------------------------------------------------------------------------
	Function: 
  		fomatTableCotizacionesToJson ($arrayTable)
  	Description: 
  		Devuelve JSON con cotizaciones
  	Parameters:
  		$arrayTable matriz con las contizaciones
#CE -------------------------------------------------------------------------------------------

Func fomatTableCotizacionesToJson($tablaArray)
	
	Local $jsonCotizaciones[1]

	If IsArray($tablaArray) Then
		ReDim $jsonCotizaciones[UBound($tablaArray, 1)-1]
		For $X = 0 To UBound($tablaArray, 1) - 1  
			Local $cotizacion
		  	;ConsoleWrite(@CRLF & $tablaArray[$X][0])
			For $Y = 0 To UBound($tablaArray, 2) - 1
				;ConsoleWrite(@CRLF & $tablaArray[$X][$Y])
				if $Y = 0 AND $X <> 0 Then
					json_put($jsonCotizaciones[$X-1], ".moneda", $tablaArray[$X][$Y])
				EndIf
				if $Y = 1 AND $X <> 0 Then
					json_put($jsonCotizaciones[$X-1], ".compra", $tablaArray[$X][$Y])
				EndIf
				if $Y = 2 AND $X <> 0 Then
					json_put($jsonCotizaciones[$X-1], ".venta", $tablaArray[$X][$Y])
				EndIf
			Next				
		Next
	Else
		Return json_encode("")
	EndIf
	Return $jsonCotizaciones
EndFunc

Func fomatTableCotizacionesHistoricoToJson($tablaArray)		
	If IsArray($tablaArray) Then
		Local $jsonCotizaciones[UBound($tablaArray, 1)-1]
		Local $headers[UBound($tablaArray, 2)]
		For $X = 0 To UBound($tablaArray, 1) - 1  
		  	;ConsoleWrite(@CRLF & $tablaArray[$X][0])
			For $Y = 0 To UBound($tablaArray, 2) - 1
				if $X=0 Then
					$headers[$Y] = $tablaArray[$X][$Y]
				Else
					json_put($jsonCotizaciones[$X-1], "." & $headers[$Y] , $tablaArray[$X][$Y])					
				EndIf				
			Next			
		Next
	Else
		Return json_encode("")
	EndIf
	Return $jsonCotizaciones
EndFunc