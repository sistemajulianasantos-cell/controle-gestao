// ─── DATA FIXA (estoques históricos MAR e ABR) ────────────────────────────────
const MAR={"BLACK LABEL":{cat:"WHISKY",est:3,salao:0},"RED LABEL":{cat:"WHISKY",est:1,salao:0},"BUFALO TRACE":{cat:"WHISKY",est:11,salao:0},"BULLEIT":{cat:"WHISKY",est:4,salao:1},"CHIVAS 12":{cat:"WHISKY",est:35,salao:1},"JACK DANIELS":{cat:"WHISKY",est:3,salao:0},"JAMESON":{cat:"WHISKY",est:22,salao:0},"SINGLETON":{cat:"WHISKY",est:10,salao:1},"3 LOBOS":{cat:"WHISKY",est:2,salao:1},"ROYAL SALUTE":{cat:"WHISKY",est:0,salao:1},"TALISKER":{cat:"WHISKY",est:0,salao:1},"BUCHANAN'S":{cat:"WHISKY",est:0,salao:1},"MARKER'S MARK":{cat:"WHISKY",est:0,salao:1},"GLENKÍNCHIE":{cat:"WHISKY",est:0,salao:0},"RARE BREED":{cat:"WHISKY",est:0,salao:0},"JIM BEAM":{cat:"WHISKY",est:0,salao:1},"LAMAS CALEDONIA":{cat:"WHISKY",est:0,salao:1},"THE GLENLIVET":{cat:"WHISKY",est:1,salao:0},"DEWAR'S 12 ANOS":{cat:"WHISKY",est:0,salao:1},"DEWAR'S 15 ANOS":{cat:"WHISKY",est:0,salao:1},"HIBIKI":{cat:"WHISKY",est:0,salao:1},"OUL PARR":{cat:"WHISKY",est:0,salao:0},"SARERAL RYE":{cat:"WHISKY",est:0,salao:1},"GIN BEEFEATER":{cat:"GIN",est:167,salao:0},"GIN BOMBAY":{cat:"GIN",est:9,salao:0},"GIN FORDS":{cat:"GIN",est:1,salao:0},"GIN HENDRICKS":{cat:"GIN",est:1,salao:0},"GIN MARTIN MILLER":{cat:"GIN",est:4,salao:6},"GIN MONKEY 47":{cat:"GIN",est:0,salao:1},"GIN NIB PERA":{cat:"GIN",est:0,salao:0},"GIN SPIRAL":{cat:"GIN",est:6,salao:0},"GIN TANQUERAY":{cat:"GIN",est:51,salao:0},"GIN YVY AR":{cat:"GIN",est:4,salao:0},"GIN YVY MAR":{cat:"GIN",est:0,salao:0},"GIN YVY MAR 200ML":{cat:"GIN",est:0,salao:0},"GIN ZURR":{cat:"GIN",est:3,salao:0},"GIN ROKU":{cat:"GIN",est:1,salao:0},"GIN VELVO DRY":{cat:"GIN",est:0,salao:0},"GIN VAN FALL":{cat:"GIN",est:0,salao:0},"GIN YVY CERRADO":{cat:"GIN",est:2,salao:0},"GIN YVY MATA ATLANTICA":{cat:"GIN",est:1,salao:0},"GIN VELVO ARTICE":{cat:"GIN",est:7,salao:0},"VODKA KETEL ONE":{cat:"VODKA",est:18,salao:2},"VODKA ABSOLUT":{cat:"VODKA",est:89,salao:0},"VODKA GREY GOOSE":{cat:"VODKA",est:16,salao:1},"VODKA HARUN":{cat:"VODKA",est:0,salao:2},"VODKA RCV":{cat:"VODKA",est:4,salao:1},"VODKA WYBOROWA":{cat:"VODKA",est:20,salao:0},"VODKA BELVEDERE":{cat:"VODKA",est:0,salao:2},"VODKA ROBERTO CAVALLI":{cat:"VODKA",est:1,salao:0},"VODKA ABSOLUT PESSEGO":{cat:"VODKA",est:0,salao:0},"VODKA STOLICHNAYA":{cat:"VODKA",est:0,salao:1},"VODKA SPIRAL":{cat:"VODKA",est:0,salao:1},"VODKA ELIT":{cat:"VODKA",est:0,salao:1},"VODKA CIROC":{cat:"VODKA",est:0,salao:0},"VODKA SKY":{cat:"VODKA",est:0,salao:0},"VODKA ABSOLUT ELIX":{cat:"VODKA",est:0,salao:1},"VODKA IMPERIAL GOLD":{cat:"VODKA",est:1,salao:0},"ANGOSTURA":{cat:"VERMUTE/BITTER",est:1,salao:4},"EMULSIFICANTE":{cat:"VERMUTE/BITTER",est:4,salao:0},"APEROL":{cat:"VERMUTE/BITTER",est:31,salao:1},"BITTER CHOCOLATE":{cat:"VERMUTE/BITTER",est:0,salao:0},"BITTER LARANJA":{cat:"VERMUTE/BITTER",est:2,salao:4},"CAMPARI":{cat:"VERMUTE/BITTER",est:20,salao:6},"CARPANO ROSSO":{cat:"VERMUTE/BITTER",est:14,salao:6},"CINZANO":{cat:"VERMUTE/BITTER",est:8,salao:1},"FERNET":{cat:"VERMUTE/BITTER",est:7,salao:1},"JAGERMEISTER":{cat:"VERMUTE/BITTER",est:3,salao:0},"AMAROGUTTA":{cat:"VERMUTE/BITTER",est:3,salao:0},"PUNT E MES":{cat:"VERMUTE/BITTER",est:3,salao:8},"PEYCHAUD'S":{cat:"VERMUTE/BITTER",est:0,salao:4},"1757":{cat:"VERMUTE/BITTER",est:1,salao:1},"CYNAR":{cat:"VERMUTE/BITTER",est:0,salao:1},"1796":{cat:"VERMUTE/BITTER",est:0,salao:1},"AUREAH ROSE":{cat:"VERMUTE/BITTER",est:0,salao:1},"ESPUMANTE 0%":{cat:"ESPUMANTES/VINHO",est:6,salao:0},"ESPUMANTE BRUT":{cat:"ESPUMANTES/VINHO",est:90,salao:0},"ESPUMANTE ROSE":{cat:"ESPUMANTES/VINHO",est:4,salao:0},"MANZA":{cat:"ESPUMANTES/VINHO",est:264,salao:7},"VINHO DO PORTO BRANCO":{cat:"ESPUMANTES/VINHO",est:6,salao:0},"FOSS MARAI ROSE":{cat:"ESPUMANTES/VINHO",est:0,salao:3},"FOSS MARAI":{cat:"ESPUMANTES/VINHO",est:0,salao:3},"DOMEC":{cat:"APERITIVOS/FORTIF.",est:2,salao:0},"LILLET":{cat:"APERITIVOS/FORTIF.",est:25,salao:1},"LILLET ROSE":{cat:"APERITIVOS/FORTIF.",est:0,salao:0},"RAMAZZOTTI AMARO":{cat:"APERITIVOS/FORTIF.",est:1,salao:1},"RAMAZZOTTI ROSATO":{cat:"APERITIVOS/FORTIF.",est:8,salao:0},"PISCO":{cat:"APERITIVOS/FORTIF.",est:4,salao:0},"SAQUE":{cat:"APERITIVOS/FORTIF.",est:2,salao:0},"NEGRONI ROMERO":{cat:"APERITIVOS/FORTIF.",est:12,salao:3},"BOULEVARDIER ROMERO":{cat:"APERITIVOS/FORTIF.",est:5,salao:3},"RUM HAVANA":{cat:"RUM",est:2,salao:0},"TEQUILA 1800 CRISTALINO":{cat:"TEQUILA",est:7,salao:3},"TEQUILA 1800 BLANCO":{cat:"TEQUILA",est:0,salao:1},"TEQUILA 1800 CRISTALINO AURORA":{cat:"TEQUILA",est:6,salao:0},"TEQUILA DON JULIO":{cat:"TEQUILA",est:2,salao:0},"TEQUILA JOSE CUERVO ESPECIAL":{cat:"TEQUILA",est:29,salao:4},"TEQUILA JOSE CUERVO TRADICIONAL":{cat:"TEQUILA",est:0,salao:0},"TEQUILA JOSE CUERVO RESERVA ANEJO":{cat:"TEQUILA",est:0,salao:1},"TEQUILA JOSE CUERVO RESERVA PLATINA":{cat:"TEQUILA",est:0,salao:1},"MAESTRO DOBEL":{cat:"TEQUILA",est:15,salao:3},"CACHACA SPIRAL":{cat:"CACHACA",est:19,salao:0},"CACHACA DONA PRETA":{cat:"CACHACA",est:0,salao:1},"ANAUE":{cat:"LICOR/SHOTS",est:1,salao:0},"ARTHURIUM":{cat:"LICOR/SHOTS",est:5,salao:0},"BALLENA COCO":{cat:"LICOR/SHOTS",est:1,salao:0},"BALLENA CARAMELO":{cat:"LICOR/SHOTS",est:0,salao:0},"BALLENA MORANGO":{cat:"LICOR/SHOTS",est:3,salao:0},"BANANINHA":{cat:"LICOR/SHOTS",est:0,salao:0},"CASSIS":{cat:"LICOR/SHOTS",est:2,salao:1},"COINTREAU":{cat:"LICOR/SHOTS",est:0,salao:0},"FIREBALL":{cat:"LICOR/SHOTS",est:9,salao:0},"FIREBALL 50ML":{cat:"LICOR/SHOTS",est:12,salao:24},"JACK FIRE":{cat:"LICOR/SHOTS",est:4,salao:0},"JAMBRUNA":{cat:"LICOR/SHOTS",est:3,salao:0},"LICOR 43":{cat:"LICOR/SHOTS",est:20,salao:4},"LICOR 43 BRULLE":{cat:"LICOR/SHOTS",est:0,salao:4},"LIMONCELLO":{cat:"LICOR/SHOTS",est:0,salao:0},"NIB SHOTS":{cat:"LICOR/SHOTS",est:40,salao:0},"PEACHTREE":{cat:"LICOR/SHOTS",est:7,salao:4},"TRIPLE SEC":{cat:"LICOR/SHOTS",est:2,salao:1},"FRAMBOESA":{cat:"XAROPE/PURE",est:12,salao:0},"PIMENTA":{cat:"XAROPE/PURE",est:5,salao:0},"ABACAXI XP":{cat:"XAROPE/PURE",est:5,salao:0},"AGAVE":{cat:"XAROPE/PURE",est:4,salao:0},"AMARENA":{cat:"XAROPE/PURE",est:7,salao:0},"AMARETO":{cat:"XAROPE/PURE",est:10,salao:0},"AMENDUAS":{cat:"XAROPE/PURE",est:3,salao:0},"AMORA":{cat:"XAROPE/PURE",est:4,salao:0},"BLUE CURACAO":{cat:"XAROPE/PURE",est:1,salao:0},"CARAMELO":{cat:"XAROPE/PURE",est:4,salao:0},"CARAMELO SALGADO":{cat:"XAROPE/PURE",est:3,salao:0},"CHICLETE":{cat:"XAROPE/PURE",est:0,salao:0},"COCO":{cat:"XAROPE/PURE",est:0,salao:0},"CRAMBERRY":{cat:"XAROPE/PURE",est:4,salao:0},"ENERGETICO":{cat:"XAROPE/PURE",est:14,salao:0},"FLOR DE SABUGUEIRO":{cat:"XAROPE/PURE",est:6,salao:0},"GENGIBRE":{cat:"XAROPE/PURE",est:0,salao:0},"POMEGRANATE ROMA":{cat:"XAROPE/PURE",est:0,salao:0},"GRENADINE":{cat:"XAROPE/PURE",est:6,salao:0},"IRIS CREAM":{cat:"XAROPE/PURE",est:0,salao:0},"LARANJA VERMELHA":{cat:"XAROPE/PURE",est:4,salao:0},"LICHIA":{cat:"XAROPE/PURE",est:12,salao:0},"LIMAO SICILIANO":{cat:"XAROPE/PURE",est:2,salao:0},"MACA VERDE":{cat:"XAROPE/PURE",est:5,salao:0},"MANGA":{cat:"XAROPE/PURE",est:0,salao:0},"MAPLE":{cat:"XAROPE/PURE",est:7,salao:0},"MARACUJA VERMELHO":{cat:"XAROPE/PURE",est:10,salao:0},"MARACUJA XP":{cat:"XAROPE/PURE",est:1,salao:0},"TONIC XP":{cat:"XAROPE/PURE",est:4,salao:0},"PESSEGO":{cat:"XAROPE/PURE",est:0,salao:0},"MELANCIA":{cat:"XAROPE/PURE",est:7,salao:0},"MEL":{cat:"XAROPE/PURE",est:4,salao:0},"MELON":{cat:"XAROPE/PURE",est:1,salao:0},"MENTA":{cat:"XAROPE/PURE",est:9,salao:0},"MENTA VERDE":{cat:"XAROPE/PURE",est:4,salao:0},"MORANGO XP":{cat:"XAROPE/PURE",est:5,salao:0},"PARAGON":{cat:"XAROPE/PURE",est:0,salao:0},"PEPINO":{cat:"XAROPE/PURE",est:8,salao:0},"PIPOCA":{cat:"XAROPE/PURE",est:10,salao:0},"PISTACHIO":{cat:"XAROPE/PURE",est:1,salao:0},"MANDARIN":{cat:"XAROPE/PURE",est:3,salao:0},"TANGERINA":{cat:"XAROPE/PURE",est:19,salao:0},"TRIPLE SEC XP":{cat:"XAROPE/PURE",est:0,salao:0},"VIOLETA":{cat:"XAROPE/PURE",est:0,salao:0},"PURE DE ABACAXI":{cat:"XAROPE/PURE",est:2,salao:0},"PURE DE BANANA":{cat:"XAROPE/PURE",est:12,salao:0},"PURE DE JABUTICABA":{cat:"XAROPE/PURE",est:2,salao:0},"PURE DE MACA":{cat:"XAROPE/PURE",est:3,salao:0},"PURE DE MARACUJA":{cat:"XAROPE/PURE",est:15,salao:0},"PURE DE PERA":{cat:"XAROPE/PURE",est:3,salao:0},"PURE DE YUZU":{cat:"XAROPE/PURE",est:4,salao:0},"PURE DE PESSEGO":{cat:"XAROPE/PURE",est:11,salao:0},"PURE DE TORANJA":{cat:"XAROPE/PURE",est:4,salao:0},"PURE DE MORANGO":{cat:"XAROPE/PURE",est:25,salao:0},"AGUA COM GAS":{cat:"SEM ALCOOL",est:95,salao:2},"AGUA COM GAS CAMBUQUIRA":{cat:"SEM ALCOOL",est:34,salao:5},"AGUA DE COCO":{cat:"SEM ALCOOL",est:0,salao:0},"AGUA SEM GAS 1.5LT":{cat:"SEM ALCOOL",est:180,salao:0},"AGUA SEM GAS 500ML":{cat:"SEM ALCOOL",est:36,salao:9},"AGUA TONICA":{cat:"SEM ALCOOL",est:254,salao:4},"CAFE SOLUVEL":{cat:"SEM ALCOOL",est:0,salao:0},"COMPOTA DE CAJU":{cat:"SEM ALCOOL",est:0,salao:0},"COMPOTA DE JABUTICABA":{cat:"SEM ALCOOL",est:2,salao:0},"MAT PESSEGO":{cat:"SEM ALCOOL",est:0,salao:0},"SUCO DE MACA":{cat:"SEM ALCOOL",est:8,salao:0},"SUCO DE MANGA":{cat:"SEM ALCOOL",est:0,salao:0},"SUCO DE PESSEGO":{cat:"SEM ALCOOL",est:8,salao:0},"SUCO LARANJA":{cat:"SEM ALCOOL",est:6,salao:0},"TABASCO":{cat:"SEM ALCOOL",est:0,salao:0},"SUCO DE MARACUJA":{cat:"SEM ALCOOL",est:2,salao:0},"SUCO DE CAJU":{cat:"SEM ALCOOL",est:0,salao:0},"CAJUINA":{cat:"SEM ALCOOL",est:6,salao:0},"ESPUMA DE BAUNILHA":{cat:"MIXING ARTESANAL",est:0,salao:0},"ESPUMA DE GENGIBRE":{cat:"MIXING ARTESANAL",est:5,salao:1},"ESPUMA DE JABUTICABA":{cat:"MIXING ARTESANAL",est:0,salao:0},"ESPUMA DE MACA":{cat:"MIXING ARTESANAL",est:0,salao:0},"ESPUMA DE SICILIANO":{cat:"MIXING ARTESANAL",est:5,salao:2},"ESPUMA DE TANGERINA":{cat:"MIXING ARTESANAL",est:3,salao:0},"GINGER ALE":{cat:"MIXING ARTESANAL",est:18,salao:0},"SODA DE GRAPEFRUIT":{cat:"MIXING ARTESANAL",est:27,salao:2},"XAROPE DE ACUCAR":{cat:"PRODUCAO",est:4,salao:0},"SUCO DE LIMAO":{cat:"PRODUCAO",est:0,salao:0},"PURE DE FRUTAS VERMELHAS":{cat:"PRODUCAO",est:13,salao:0},"MARACUJA PROD":{cat:"PRODUCAO",est:0,salao:0},"CANECA DE COBRE":{cat:"COPOS/TAÇAS",est:288,salao:9},"COPO BAIXO ELYSIA":{cat:"COPOS/TAÇAS",est:144,salao:4},"COPO BAIXO LISO (ENVY)":{cat:"COPOS/TAÇAS",est:207,salao:5},"COPO BAIXO REVEL":{cat:"COPOS/TAÇAS",est:24,salao:2},"COPO BAIXO TIMELEES":{cat:"COPOS/TAÇAS",est:306,salao:6},"COPO BAIXO XTRA":{cat:"COPOS/TAÇAS",est:360,salao:8},"COPO LONG ELYSIA":{cat:"COPOS/TAÇAS",est:95,salao:5},"COPO BAIXO PORCELANA":{cat:"COPOS/TAÇAS",est:85,salao:5},"COPO LONG REVEL":{cat:"COPOS/TAÇAS",est:39,salao:20},"COPO LONG LISO MODELO NOVO":{cat:"COPOS/TAÇAS",est:204,salao:0},"COPO LONG LISO MODELO VELHO":{cat:"COPOS/TAÇAS",est:95,salao:5},"COPO BOODY MARY":{cat:"COPOS/TAÇAS",est:96,salao:6},"COPO LONG XTRA":{cat:"COPOS/TAÇAS",est:270,salao:13},"TAÇA CALISE AMERICA (RECEPTIVO)":{cat:"COPOS/TAÇAS",est:107,salao:6},"TAÇA COUPE AMERICA":{cat:"COPOS/TAÇAS",est:75,salao:1},"TAÇA COUPE TIMELEES":{cat:"COPOS/TAÇAS",est:209,salao:12},"TAÇA DE VINHO BRUNELLO":{cat:"COPOS/TAÇAS",est:435,salao:5},"TAÇA DE VINHO BRUNELLO (LILLET)":{cat:"COPOS/TAÇAS",est:100,salao:21},"TAÇA DE VINHO XTRA":{cat:"COPOS/TAÇAS",est:465,salao:15},"TAÇA ESPUMANTE XTRA":{cat:"COPOS/TAÇAS",est:39,salao:6},"TAÇA HURACANE":{cat:"COPOS/TAÇAS",est:0,salao:2},"TAÇA MARTINI":{cat:"COPOS/TAÇAS",est:30,salao:5},"TAÇA BOEMIA":{cat:"COPOS/TAÇAS",est:57,salao:4},"TAÇA MARTINI GRANDE":{cat:"COPOS/TAÇAS",est:0,salao:7}};
const ABR={"BLACK LABEL":{cat:"WHISKY",est:3,salao:1},"RED LABEL":{cat:"WHISKY",est:1,salao:0},"BUFALO TRACE":{cat:"WHISKY",est:11,salao:0},"BULLEIT":{cat:"WHISKY",est:4,salao:1},"CHIVAS 12":{cat:"WHISKY",est:35,salao:0},"JACK DANIELS":{cat:"WHISKY",est:4,salao:1},"JAMESON":{cat:"WHISKY",est:30,salao:0},"SINGLETON":{cat:"WHISKY",est:11,salao:1},"3 LOBOS":{cat:"WHISKY",est:2,salao:1},"ROYAL SALUTE":{cat:"WHISKY",est:0,salao:1},"TALISKER":{cat:"WHISKY",est:0,salao:1},"BUCHANAN'S":{cat:"WHISKY",est:0,salao:1},"MARKER'S MARK":{cat:"WHISKY",est:0,salao:1},"GLENKÍNCHIE":{cat:"WHISKY",est:0,salao:0},"RARE BREED":{cat:"WHISKY",est:0,salao:0},"JIM BEAM":{cat:"WHISKY",est:0,salao:1},"LAMAS CALEDONIA":{cat:"WHISKY",est:0,salao:1},"THE GLENLIVET":{cat:"WHISKY",est:1,salao:1},"DEWAR'S 12 ANOS":{cat:"WHISKY",est:0,salao:1},"DEWAR'S 15 ANOS":{cat:"WHISKY",est:0,salao:1},"HIBIKI":{cat:"WHISKY",est:0,salao:1},"OUL PARR":{cat:"WHISKY",est:0,salao:1},"SARERAL RYE":{cat:"WHISKY",est:0,salao:1},"GIN BEEFEATER":{cat:"GIN",est:41,salao:0},"GIN BOMBAY":{cat:"GIN",est:9,salao:0},"GIN FORDS":{cat:"GIN",est:0,salao:1},"GIN HENDRICKS":{cat:"GIN",est:1,salao:0},"GIN MARTIN MILLER":{cat:"GIN",est:4,salao:7},"GIN MONKEY 47":{cat:"GIN",est:0,salao:1},"GIN NIB PERA":{cat:"GIN",est:0,salao:0},"GIN SPIRAL":{cat:"GIN",est:4,salao:0},"GIN TANQUERAY":{cat:"GIN",est:41,salao:0},"GIN YVY AR":{cat:"GIN",est:0,salao:0},"GIN YVY MAR":{cat:"GIN",est:0,salao:0},"GIN YVY MAR 200ML":{cat:"GIN",est:0,salao:0},"GIN ZURR":{cat:"GIN",est:3,salao:0},"GIN ROKU":{cat:"GIN",est:0,salao:0},"GIN VELVO DRY":{cat:"GIN",est:0,salao:0},"GIN VAN FALL":{cat:"GIN",est:0,salao:0},"GIN YVY CERRADO":{cat:"GIN",est:2,salao:0},"GIN YVY MATA ATLANTICA":{cat:"GIN",est:1,salao:0},"GIN VELVO ARTICE":{cat:"GIN",est:7,salao:0},"VODKA KETEL ONE":{cat:"VODKA",est:17,salao:1},"VODKA ABSOLUT":{cat:"VODKA",est:60,salao:0},"VODKA GREY GOOSE":{cat:"VODKA",est:16,salao:0},"VODKA HARUN":{cat:"VODKA",est:0,salao:2},"VODKA RCV":{cat:"VODKA",est:4,salao:1},"VODKA WYBOROWA":{cat:"VODKA",est:18,salao:0},"VODKA BELVEDERE":{cat:"VODKA",est:0,salao:2},"VODKA ROBERTO CAVALLI":{cat:"VODKA",est:1,salao:0},"VODKA ABSOLUT PESSEGO":{cat:"VODKA",est:0,salao:0},"VODKA STOLICHNAYA":{cat:"VODKA",est:0,salao:1},"VODKA SPIRAL":{cat:"VODKA",est:0,salao:0},"VODKA ELIT":{cat:"VODKA",est:0,salao:1},"VODKA CIROC":{cat:"VODKA",est:0,salao:1},"VODKA SKY":{cat:"VODKA",est:0,salao:0},"VODKA ABSOLUT ELIX":{cat:"VODKA",est:0,salao:1},"VODKA IMPERIAL GOLD":{cat:"VODKA",est:1,salao:0},"ANGOSTURA":{cat:"VERMUTE/BITTER",est:8,salao:1},"EMULSIFICANTE":{cat:"VERMUTE/BITTER",est:0,salao:0},"APEROL":{cat:"VERMUTE/BITTER",est:13,salao:1},"BITTER CHOCOLATE":{cat:"VERMUTE/BITTER",est:0,salao:0},"BITTER LARANJA":{cat:"VERMUTE/BITTER",est:2,salao:5},"CAMPARI":{cat:"VERMUTE/BITTER",est:15,salao:7},"CARPANO ROSSO":{cat:"VERMUTE/BITTER",est:12,salao:6},"CINZANO":{cat:"VERMUTE/BITTER",est:6,salao:0},"FERNET":{cat:"VERMUTE/BITTER",est:5,salao:1},"JAGERMEISTER":{cat:"VERMUTE/BITTER",est:3,salao:0},"AMAROGUTTA":{cat:"VERMUTE/BITTER",est:3,salao:0},"PUNT E MES":{cat:"VERMUTE/BITTER",est:1,salao:8},"PEYCHAUD'S":{cat:"VERMUTE/BITTER",est:0,salao:4},"1757":{cat:"VERMUTE/BITTER",est:1,salao:1},"CYNAR":{cat:"VERMUTE/BITTER",est:0,salao:0},"1796":{cat:"VERMUTE/BITTER",est:0,salao:0},"AUREAH ROSE":{cat:"VERMUTE/BITTER",est:0,salao:0},"ESPUMANTE 0%":{cat:"ESPUMANTES/VINHO",est:6,salao:0},"ESPUMANTE LE BLANC":{cat:"ESPUMANTES/VINHO",est:70,salao:0},"ESPUMANTE ROSE":{cat:"ESPUMANTES/VINHO",est:4,salao:0},"MANZA":{cat:"ESPUMANTES/VINHO",est:216,salao:17},"VINHO DO PORTO BRANCO":{cat:"ESPUMANTES/VINHO",est:6,salao:0},"FOSS MARAI ROSE":{cat:"ESPUMANTES/VINHO",est:0,salao:3},"FOSS MARAI":{cat:"ESPUMANTES/VINHO",est:0,salao:3},"DOMEC":{cat:"APERITIVOS/FORTIF.",est:2,salao:0},"LILLET":{cat:"APERITIVOS/FORTIF.",est:25,salao:0},"LILLET ROSE":{cat:"APERITIVOS/FORTIF.",est:0,salao:0},"RAMAZZOTTI AMARO":{cat:"APERITIVOS/FORTIF.",est:1,salao:0},"RAMAZZOTTI ROSATO":{cat:"APERITIVOS/FORTIF.",est:6,salao:0},"PISCO":{cat:"APERITIVOS/FORTIF.",est:4,salao:0},"SAQUE":{cat:"APERITIVOS/FORTIF.",est:15,salao:0},"NEGRONI ROMERO":{cat:"APERITIVOS/FORTIF.",est:8,salao:4},"BOULEVARDIER ROMERO":{cat:"APERITIVOS/FORTIF.",est:5,salao:3},"RUM HAVANA":{cat:"RUM",est:2,salao:0},"TEQUILA 1800 CRISTALINO":{cat:"TEQUILA",est:2,salao:3},"TEQUILA 1800 BLANCO":{cat:"TEQUILA",est:6,salao:1},"TEQUILA 1800 CRISTALINO AURORA":{cat:"TEQUILA",est:6,salao:0},"TEQUILA DON JULIO":{cat:"TEQUILA",est:2,salao:0},"TEQUILA JOSE CUERVO ESPECIAL":{cat:"TEQUILA",est:20,salao:4},"TEQUILA JOSE CUERVO TRADICIONAL":{cat:"TEQUILA",est:0,salao:0},"TEQUILA JOSE CUERVO RESERVA ANEJO":{cat:"TEQUILA",est:0,salao:1},"TEQUILA JOSE CUERVO RESERVA PLATINA":{cat:"TEQUILA",est:0,salao:1},"MAESTRO DOBEL":{cat:"TEQUILA",est:15,salao:3},"CACHACA SPIRAL":{cat:"CACHACA",est:17,salao:0},"CACHACA DONA PRETA":{cat:"CACHACA",est:0,salao:1},"ANAUE":{cat:"LICOR/SHOTS",est:0,salao:0},"ARTHURIUM":{cat:"LICOR/SHOTS",est:5,salao:0},"BALLENA COCO":{cat:"LICOR/SHOTS",est:1,salao:0},"BALLENA CARAMELO":{cat:"LICOR/SHOTS",est:0,salao:0},"BALLENA MORANGO":{cat:"LICOR/SHOTS",est:1,salao:0},"BANANINHA":{cat:"LICOR/SHOTS",est:4,salao:0},"CASSIS":{cat:"LICOR/SHOTS",est:1,salao:1},"COINTREAU":{cat:"LICOR/SHOTS",est:0,salao:0},"FIREBALL":{cat:"LICOR/SHOTS",est:11,salao:0},"FIREBALL 50ML":{cat:"LICOR/SHOTS",est:12,salao:12},"JACK FIRE":{cat:"LICOR/SHOTS",est:4,salao:1},"JAMBRUNA":{cat:"LICOR/SHOTS",est:2,salao:0},"LICOR 43":{cat:"LICOR/SHOTS",est:16,salao:4},"LICOR 43 BRULLE":{cat:"LICOR/SHOTS",est:0,salao:3},"LIMONCELLO":{cat:"LICOR/SHOTS",est:6,salao:0},"NIB SHOTS":{cat:"LICOR/SHOTS",est:40,salao:0},"PEACHTREE":{cat:"LICOR/SHOTS",est:7,salao:5},"TRIPLE SEC":{cat:"LICOR/SHOTS",est:5,salao:0},"FRAMBOESA":{cat:"XAROPE/PURE",est:10,salao:0},"PIMENTA":{cat:"XAROPE/PURE",est:5,salao:0},"ABACAXI XP":{cat:"XAROPE/PURE",est:5,salao:0},"AGAVE":{cat:"XAROPE/PURE",est:2,salao:0},"AMARENA":{cat:"XAROPE/PURE",est:7,salao:0},"AMARETO":{cat:"XAROPE/PURE",est:10,salao:0},"AMENDUAS":{cat:"XAROPE/PURE",est:2,salao:0},"AMORA":{cat:"XAROPE/PURE",est:2,salao:0},"BLUE CURACAO":{cat:"XAROPE/PURE",est:1,salao:0},"CARAMELO":{cat:"XAROPE/PURE",est:4,salao:0},"CARAMELO SALGADO":{cat:"XAROPE/PURE",est:3,salao:0},"CHICLETE":{cat:"XAROPE/PURE",est:0,salao:0},"COCO":{cat:"XAROPE/PURE",est:0,salao:0},"CRAMBERRY":{cat:"XAROPE/PURE",est:4,salao:0},"ENERGETICO":{cat:"XAROPE/PURE",est:12,salao:0},"FLOR DE SABUGUEIRO":{cat:"XAROPE/PURE",est:3,salao:0},"GENGIBRE":{cat:"XAROPE/PURE",est:1,salao:0},"POMEGRANATE ROMA":{cat:"XAROPE/PURE",est:3,salao:0},"GRENADINE":{cat:"XAROPE/PURE",est:5,salao:0},"IRIS CREAM":{cat:"XAROPE/PURE",est:1,salao:0},"LARANJA VERMELHA":{cat:"XAROPE/PURE",est:1,salao:0},"LICHIA":{cat:"XAROPE/PURE",est:2,salao:0},"LIMAO SICILIANO":{cat:"XAROPE/PURE",est:2,salao:0},"MACA VERDE":{cat:"XAROPE/PURE",est:4,salao:0},"MANGA":{cat:"XAROPE/PURE",est:0,salao:0},"MAPLE":{cat:"XAROPE/PURE",est:0,salao:0},"MARACUJA VERMELHO":{cat:"XAROPE/PURE",est:9,salao:0},"MARACUJA XP":{cat:"XAROPE/PURE",est:0,salao:0},"TONIC XP":{cat:"XAROPE/PURE",est:4,salao:0},"PESSEGO":{cat:"XAROPE/PURE",est:0,salao:0},"MELANCIA":{cat:"XAROPE/PURE",est:6,salao:0},"MEL":{cat:"XAROPE/PURE",est:4,salao:0},"MELON":{cat:"XAROPE/PURE",est:1,salao:0},"MENTA":{cat:"XAROPE/PURE",est:7,salao:0},"MENTA VERDE":{cat:"XAROPE/PURE",est:4,salao:0},"MORANGO XP":{cat:"XAROPE/PURE",est:1,salao:0},"PARAGON":{cat:"XAROPE/PURE",est:0,salao:0},"PEPINO":{cat:"XAROPE/PURE",est:6,salao:0},"PIPOCA":{cat:"XAROPE/PURE",est:10,salao:0},"PISTACHIO":{cat:"XAROPE/PURE",est:1,salao:0},"MANDARIN":{cat:"XAROPE/PURE",est:2,salao:0},"TANGERINA":{cat:"XAROPE/PURE",est:14,salao:0},"TRIPLE SEC XP":{cat:"XAROPE/PURE",est:1,salao:0},"VIOLETA":{cat:"XAROPE/PURE",est:2,salao:0},"PURE DE ABACAXI":{cat:"XAROPE/PURE",est:10,salao:0},"PURE DE BANANA":{cat:"XAROPE/PURE",est:2,salao:0},"PURE DE JABUTICABA":{cat:"XAROPE/PURE",est:3,salao:0},"PURE DE MACA":{cat:"XAROPE/PURE",est:8,salao:0},"PURE DE MARACUJA":{cat:"XAROPE/PURE",est:3,salao:0},"PURE DE PERA":{cat:"XAROPE/PURE",est:9,salao:0},"PURE DE YUZU":{cat:"XAROPE/PURE",est:4,salao:0},"PURE DE PESSEGO":{cat:"XAROPE/PURE",est:11,salao:0},"PURE DE TORANJA":{cat:"XAROPE/PURE",est:4,salao:0},"PURE DE MORANGO":{cat:"XAROPE/PURE",est:24,salao:0},"AGUA COM GAS":{cat:"SEM ALCOOL",est:470,salao:5},"AGUA COM GAS CAMBUQUIRA":{cat:"SEM ALCOOL",est:34,salao:3},"AGUA DE COCO":{cat:"SEM ALCOOL",est:0,salao:0},"AGUA SEM GAS 1.5LT":{cat:"SEM ALCOOL",est:165,salao:0},"AGUA SEM GAS 500ML":{cat:"SEM ALCOOL",est:23,salao:5},"AGUA TONICA":{cat:"SEM ALCOOL",est:21,salao:0},"CAFE SOLUVEL":{cat:"SEM ALCOOL",est:0,salao:0},"COMPOTA DE CAJU":{cat:"SEM ALCOOL",est:0,salao:0},"COMPOTA DE JABUTICABA":{cat:"SEM ALCOOL",est:2,salao:0},"MAT PESSEGO":{cat:"SEM ALCOOL",est:0,salao:0},"SUCO DE MACA":{cat:"SEM ALCOOL",est:8,salao:0},"SUCO DE MANGA":{cat:"SEM ALCOOL",est:0,salao:0},"SUCO DE PESSEGO":{cat:"SEM ALCOOL",est:7,salao:0},"SUCO LARANJA":{cat:"SEM ALCOOL",est:5,salao:0},"TABASCO":{cat:"SEM ALCOOL",est:0,salao:0},"SUCO DE MARACUJA":{cat:"SEM ALCOOL",est:1,salao:0},"SUCO DE CAJU":{cat:"SEM ALCOOL",est:0,salao:0},"CAJUINA":{cat:"SEM ALCOOL",est:6,salao:0},"ESPUMA DE BAUNILHA":{cat:"MIXING ARTESANAL",est:0,salao:0},"ESPUMA DE GENGIBRE":{cat:"MIXING ARTESANAL",est:7,salao:1},"ESPUMA DE JABUTICABA":{cat:"MIXING ARTESANAL",est:0,salao:0},"ESPUMA DE MACA":{cat:"MIXING ARTESANAL",est:0,salao:0},"ESPUMA DE SICILIANO":{cat:"MIXING ARTESANAL",est:3,salao:1},"ESPUMA DE TANGERINA":{cat:"MIXING ARTESANAL",est:2,salao:0},"GINGER ALE":{cat:"MIXING ARTESANAL",est:24,salao:1},"SODA DE GRAPEFRUIT":{cat:"MIXING ARTESANAL",est:22,salao:1},"XAROPE DE ACUCAR":{cat:"PRODUCAO",est:3,salao:0},"SUCO DE LIMAO":{cat:"PRODUCAO",est:1,salao:0},"PURE DE FRUTAS VERMELHAS":{cat:"PRODUCAO",est:16,salao:1},"MARACUJA PROD":{cat:"PRODUCAO",est:1,salao:1},"CANECA DE COBRE":{cat:"COPOS/TAÇAS",est:283,salao:9},"COPO BAIXO ELYSIA":{cat:"COPOS/TAÇAS",est:143,salao:4},"COPO BAIXO LISO (ENVY)":{cat:"COPOS/TAÇAS",est:195,salao:5},"COPO BAIXO REVEL":{cat:"COPOS/TAÇAS",est:28,salao:2},"COPO BAIXO TIMELEES":{cat:"COPOS/TAÇAS",est:278,salao:6},"COPO BAIXO XTRA":{cat:"COPOS/TAÇAS",est:342,salao:8},"COPO LONG ELYSIA":{cat:"COPOS/TAÇAS",est:89,salao:5},"COPO BAIXO PORCELANA":{cat:"COPOS/TAÇAS",est:96,salao:5},"COPO LONG REVEL":{cat:"COPOS/TAÇAS",est:62,salao:20},"COPO LONG LISO MODELO NOVO":{cat:"COPOS/TAÇAS",est:216,salao:0},"COPO LONG LISO MODELO VELHO":{cat:"COPOS/TAÇAS",est:95,salao:5},"COPO BOODY MARY":{cat:"COPOS/TAÇAS",est:96,salao:6},"COPO LONG XTRA":{cat:"COPOS/TAÇAS",est:285,salao:13},"TAÇA CALISE AMERICA (RECEPTIVO)":{cat:"COPOS/TAÇAS",est:106,salao:6},"TAÇA COUPE AMERICA":{cat:"COPOS/TAÇAS",est:75,salao:1},"TAÇA COUPE TIMELEES":{cat:"COPOS/TAÇAS",est:195,salao:12},"TAÇA DE VINHO BRUNELLO":{cat:"COPOS/TAÇAS",est:450,salao:5},"TAÇA DE VINHO BRUNELLO (LILLET)":{cat:"COPOS/TAÇAS",est:100,salao:21},"TAÇA DE VINHO XTRA":{cat:"COPOS/TAÇAS",est:415,salao:15},"TAÇA ESPUMANTE XTRA":{cat:"COPOS/TAÇAS",est:39,salao:6},"TAÇA HURACANE":{cat:"COPOS/TAÇAS",est:0,salao:2},"TAÇA MARTINI":{cat:"COPOS/TAÇAS",est:30,salao:0},"TAÇA BOEMIA":{cat:"COPOS/TAÇAS",est:57,salao:0},"TAÇA MARTINI GRANDE":{cat:"COPOS/TAÇAS",est:0,salao:0}};

const SNAP={'mar':{label:'30/03/2025',labelFull:'30/03/2025 — Março',data:MAR},'abr':{label:'28/04/2025',labelFull:'28/04/2025 — Abril',data:ABR}};
const nomes=Object.keys(MAR);
const cats=[...new Set(nomes.map(n=>MAR[n].cat))].sort();

const QUEBRAS_EVENTO_PRELOAD=[{"id":"QE001","evento":"Casamento Ana Clara e Stian","data":"2026-04-04","local":"Palacio","total":930.0,"itens":[{"prod":"COPO BAIXO ELYSIA","qtd":3,"custo":30.0,"total":90.0},{"prod":"COPO BAIXO TIMELEES","qtd":19,"custo":30.0,"total":570.0},{"prod":"COPO LONG XTRA","qtd":2,"custo":35.0,"total":70.0},{"prod":"TAÇA DE VINHO XTRA","qtd":6,"custo":45.0,"total":270.0}]},{"id":"QE002","evento":"Bodas Renata e Claudio","data":"2026-04-04","local":"Espaço By Bia","total":90.0,"itens":[{"prod":"COPO BAIXO XTRA","qtd":2,"custo":45.0,"total":90.0}]},{"id":"QE003","evento":"Aniversário 15 anos - Chris Kalab","data":"2026-04-10","local":"Contemporâneo","total":390.0,"itens":[{"prod":"TAÇA COUPE TIMELEES","qtd":1,"custo":40.0,"total":40.0},{"prod":"CANECA DE COBRE","qtd":1,"custo":55.0,"total":55.0},{"prod":"TAÇA DE VINHO BRUNELLO","qtd":5,"custo":35.0,"total":175.0},{"prod":"COPO LONG XTRA","qtd":2,"custo":40.0,"total":80.0},{"prod":"COPO BAIXO ELYSIA","qtd":1,"custo":40.0,"total":40.0}]},{"id":"QE004","evento":"Aniversário 50 Anos - Lecult Cerimonial","data":"2026-04-11","local":"Nova Lima","total":0.0,"itens":[]},{"id":"QE005","evento":"Aniversário 23 Anos - Eduardo Guimaraes","data":"2026-04-11","local":"Serra dos Manacás","total":190.0,"itens":[{"prod":"CANECA DE COBRE","qtd":2,"custo":55.0,"total":110.0},{"prod":"COPO LONG LISO MODELO NOVO","qtd":2,"custo":40.0,"total":80.0}]},{"id":"QE006","evento":"Aniversário 11 Anos - Ana Laura","data":"2026-04-11","local":"Extremo Park","total":0.0,"itens":[]},{"id":"QE007","evento":"Casamento - Formato Cerimonial","data":"2026-04-11","local":"São Bento","total":960.0,"itens":[{"prod":"COPO LONG LISO MODELO NOVO","qtd":5,"custo":40.0,"total":200.0},{"prod":"TAÇA CALISE AMERICA (RECEPTIVO)","qtd":1,"custo":40.0,"total":40.0},{"prod":"TAÇA DE VINHO XTRA","qtd":10,"custo":40.0,"total":400.0},{"prod":"COPO BAIXO ELYSIA","qtd":3,"custo":40.0,"total":120.0},{"prod":"COPO BAIXO XTRA","qtd":3,"custo":40.0,"total":120.0}]},{"id":"QE008","evento":"Casamento Ana e Bruno","data":"2026-04-18","local":"Espaço Mariângela","total":1105.0,"itens":[{"prod":"TAÇA DE VINHO XTRA","qtd":10,"custo":50.0,"total":500.0},{"prod":"CANECA DE COBRE","qtd":3,"custo":55.0,"total":165.0},{"prod":"COPO BAIXO XTRA","qtd":4,"custo":40.0,"total":160.0},{"prod":"COPO BAIXO TIMELEES","qtd":5,"custo":40.0,"total":200.0}]},{"id":"QE009","evento":"Casamento Nina e Igor","data":"2026-04-18","local":"Automóvel Clube","total":335.0,"itens":[{"prod":"TAÇA DE VINHO XTRA","qtd":1,"custo":40.0,"total":40.0},{"prod":"CANECA DE COBRE","qtd":1,"custo":55.0,"total":55.0},{"prod":"COPO BAIXO ELYSIA","qtd":3,"custo":40.0,"total":120.0},{"prod":"COPO LONG ELYSIA","qtd":3,"custo":40.0,"total":120.0}]},{"id":"QE010","evento":"Aniversário 40 Anos - Fabi Lopes","data":"2026-04-18","local":"Vila Da Serra","total":0.0,"itens":[]}];
const QUEBRAS_PRELOAD=[{"prod":"COPO BAIXO ELYSIA","data":"2026-04-04","qtd":3,"motivo":"Quebra/Avaria","custo":30.0,"obs":"Casamento Ana Clara e Stian — Palacio"},{"prod":"COPO BAIXO TIMELEES","data":"2026-04-04","qtd":19,"motivo":"Quebra/Avaria","custo":30.0,"obs":"Casamento Ana Clara e Stian — Palacio"},{"prod":"COPO LONG XTRA","data":"2026-04-04","qtd":2,"motivo":"Quebra/Avaria","custo":35.0,"obs":"Casamento Ana Clara e Stian — Palacio"},{"prod":"TAÇA DE VINHO XTRA","data":"2026-04-04","qtd":6,"motivo":"Quebra/Avaria","custo":45.0,"obs":"Casamento Ana Clara e Stian — Palacio"},{"prod":"COPO BAIXO XTRA","data":"2026-04-04","qtd":2,"motivo":"Quebra/Avaria","custo":45.0,"obs":"Bodas Renata e Claudio — Espaço By Bia"},{"prod":"TAÇA COUPE TIMELEES","data":"2026-04-10","qtd":1,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Aniversário 15 anos - Chris Kalab — Contemporâneo"},{"prod":"CANECA DE COBRE","data":"2026-04-10","qtd":1,"motivo":"Quebra/Avaria","custo":55.0,"obs":"Aniversário 15 anos - Chris Kalab — Contemporâneo"},{"prod":"TAÇA DE VINHO BRUNELLO","data":"2026-04-10","qtd":5,"motivo":"Quebra/Avaria","custo":35.0,"obs":"Aniversário 15 anos - Chris Kalab — Contemporâneo"},{"prod":"COPO LONG XTRA","data":"2026-04-10","qtd":2,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Aniversário 15 anos - Chris Kalab — Contemporâneo"},{"prod":"COPO BAIXO ELYSIA","data":"2026-04-10","qtd":1,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Aniversário 15 anos - Chris Kalab — Contemporâneo"},{"prod":"CANECA DE COBRE","data":"2026-04-11","qtd":2,"motivo":"Quebra/Avaria","custo":55.0,"obs":"Aniversário 23 Anos - Eduardo Guimaraes — Serra dos Manacás"},{"prod":"COPO LONG LISO MODELO NOVO","data":"2026-04-11","qtd":2,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Aniversário 23 Anos - Eduardo Guimaraes — Serra dos Manacás"},{"prod":"COPO LONG LISO MODELO NOVO","data":"2026-04-11","qtd":5,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Casamento - Formato Cerimonial — São Bento"},{"prod":"TAÇA CALISE AMERICA (RECEPTIVO)","data":"2026-04-11","qtd":1,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Casamento - Formato Cerimonial — São Bento"},{"prod":"TAÇA DE VINHO XTRA","data":"2026-04-11","qtd":10,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Casamento - Formato Cerimonial — São Bento"},{"prod":"COPO BAIXO ELYSIA","data":"2026-04-11","qtd":3,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Casamento - Formato Cerimonial — São Bento"},{"prod":"COPO BAIXO XTRA","data":"2026-04-11","qtd":3,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Casamento - Formato Cerimonial — São Bento"},{"prod":"TAÇA DE VINHO XTRA","data":"2026-04-18","qtd":10,"motivo":"Quebra/Avaria","custo":50.0,"obs":"Casamento Ana e Bruno — Espaço Mariângela"},{"prod":"CANECA DE COBRE","data":"2026-04-18","qtd":3,"motivo":"Quebra/Avaria","custo":55.0,"obs":"Casamento Ana e Bruno — Espaço Mariângela"},{"prod":"COPO BAIXO XTRA","data":"2026-04-18","qtd":4,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Casamento Ana e Bruno — Espaço Mariângela"},{"prod":"COPO BAIXO TIMELEES","data":"2026-04-18","qtd":5,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Casamento Ana e Bruno — Espaço Mariângela"},{"prod":"TAÇA DE VINHO XTRA","data":"2026-04-18","qtd":1,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Casamento Nina e Igor — Automóvel Clube"},{"prod":"CANECA DE COBRE","data":"2026-04-18","qtd":1,"motivo":"Quebra/Avaria","custo":55.0,"obs":"Casamento Nina e Igor — Automóvel Clube"},{"prod":"COPO BAIXO ELYSIA","data":"2026-04-18","qtd":3,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Casamento Nina e Igor — Automóvel Clube"},{"prod":"COPO LONG ELYSIA","data":"2026-04-18","qtd":3,"motivo":"Quebra/Avaria","custo":40.0,"obs":"Casamento Nina e Igor — Automóvel Clube"}];
window.QUEBRAS_PRELOAD = QUEBRAS_PRELOAD;
const FESTAS_PRELOAD=[{"id":"F001","nome":"Casamento Ana Clara e Stian","data":"2026-04-04","local":"Palacio","resp":"","status":"encerrada","valor_total_evento":7800.9,"itens":[{"prod":"MANZA","qtd":12,"consumido":12,"retornado":0,"valor":216.0},{"prod":"VODKA ABSOLUT","qtd":2,"consumido":2,"retornado":0,"valor":171.8},{"prod":"GIN TANQUERAY","qtd":8,"consumido":8,"retornado":0,"valor":1000.0},{"prod":"APEROL","qtd":7,"consumido":7,"retornado":0,"valor":398.3},{"prod":"CAMPARI","qtd":1,"consumido":1,"retornado":0,"valor":60.0},{"prod":"CARPANO ROSSO","qtd":1,"consumido":1,"retornado":0,"valor":140.0},{"prod":"TEQUILA 1800 CRISTALINO","qtd":7,"consumido":7,"retornado":0,"valor":3010.0},{"prod":"LICOR 43","qtd":5,"consumido":5,"retornado":0,"valor":850.0},{"prod":"FIREBALL","qtd":2,"consumido":2,"retornado":0,"valor":219.8},{"prod":"BANANINHA","qtd":2,"consumido":2,"retornado":0,"valor":180.0},{"prod":"FERNET","qtd":2,"consumido":2,"retornado":0,"valor":360.0},{"prod":"CACHACA SPIRAL","qtd":3,"consumido":3,"retornado":0,"valor":195.0}]},{"id":"F002","nome":"Bodas Renata e Claudio","data":"2026-04-04","local":"Espaço By Bia","resp":"","status":"encerrada","valor_total_evento":0,"itens":[]},{"id":"F003","nome":"Casamento Ana e Bruno","data":"2026-04-18","local":"Espaço Mariângela","resp":"","status":"encerrada","valor_total_evento":7331.4,"itens":[{"prod":"APEROL","qtd":12,"consumido":12,"retornado":0,"valor":660.0},{"prod":"VODKA ABSOLUT","qtd":5,"consumido":5,"retornado":0,"valor":429.5},{"prod":"JAMESON","qtd":12,"consumido":12,"retornado":0,"valor":1188.0},{"prod":"GIN BEEFEATER","qtd":9,"consumido":9,"retornado":0,"valor":809.1},{"prod":"CAMPARI","qtd":2,"consumido":2,"retornado":0,"valor":130.0},{"prod":"CINZANO","qtd":2,"consumido":2,"retornado":0,"valor":110.0},{"prod":"FIREBALL","qtd":2,"consumido":2,"retornado":0,"valor":179.8}]},{"id":"F004","nome":"Aniversário 40 Anos - Fabi Lopes","data":"2026-04-18","local":"Vila Da Serra","resp":"","status":"encerrada","valor_total_evento":590.0,"itens":[{"prod":"ESPUMA DE GENGIBRE","qtd":1,"consumido":1,"retornado":0,"valor":75.0},{"prod":"ESPUMA DE SICILIANO","qtd":1,"consumido":1,"retornado":0,"valor":75.0},{"prod":"GINGER ALE","qtd":4,"consumido":4,"retornado":0,"valor":140.0},{"prod":"SODA DE GRAPEFRUIT","qtd":4,"consumido":4,"retornado":0,"valor":140.0}]},{"id":"F005","nome":"Casamento Nina e Igor","data":"2026-04-18","local":"Automóvel Clube","resp":"","status":"encerrada","valor_total_evento":3735.0,"itens":[]},{"id":"F006","nome":"Aniversário 50 Anos - Lecult Cerimonial","data":"2026-04-11","local":"Nova Lima","resp":"","status":"encerrada","valor_total_evento":9485.0,"itens":[]},{"id":"F007","nome":"Aniversário 23 Anos - Eduardo Guimaraes","data":"2026-04-11","local":"Serra dos Manacás","resp":"","status":"encerrada","valor_total_evento":0,"itens":[]},{"id":"F008","nome":"Aniversário 15 anos - Chris Kalab","data":"2026-04-10","local":"Contemporâneo","resp":"","status":"encerrada","valor_total_evento":0,"itens":[]},{"id":"F009","nome":"Casamento - Formato Cerimonial","data":"2026-04-11","local":"São Bento","resp":"","status":"encerrada","valor_total_evento":6682.88,"itens":[]},{"id":"F010","nome":"Aniversário 11 Anos - Ana Laura","data":"2026-04-11","local":"Extremo Park","resp":"","status":"encerrada","valor_total_evento":0.0,"itens":[]}];
window.FESTAS_PRELOAD = FESTAS_PRELOAD;

// ─── DADOS DINÂMICOS (Firebase preenche isso) ─────────────────────────────────
const D={
  fornecedores:[],
  entradas:[],
  quebras:[],
  festas:[],
  contagens:[],   // ← NOVO: histórico de contagens semanais
  precos:{}       // ← NOVO: preços de custo e revenda por produto
};

function sv(k){if(window.svFirebase)window.svFirebase(k);}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fN(n){return Number(n||0).toLocaleString('pt-BR')}
function fR(n){return n?'R$ '+Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}
function td(){return new Date().toISOString().slice(0,10)}
function fd(d){return d?d.split('-').reverse().join('/'):'—'}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function rFechamento(){
  const allF=[...D.festas,...FESTAS_PRELOAD.filter(p=>!D.festas.find(f=>f.id===p.id))];
  const uso={};
  nomes.forEach(n=>uso[n]=0);
  allF.filter(f=>f.status==='encerrada').forEach(f=>{
    f.itens.forEach(i=>{if(uso[i.prod]!==undefined)uso[i.prod]+=(i.consumido||i.qtd||0);});
  });
  D.quebras.forEach(q=>{if(uso[q.prod]!==undefined)uso[q.prod]+=q.qtd;});

  const prodComMovimento=Object.keys(uso).filter(n=>uso[n]>0);
  const prodParado=nomes.filter(n=>{const m=MAR[n];return uso[n]===0&&(m.est+m.salao)>0&&m.cat!=='COPOS/TAÇAS';});
  const totalFat=allF.reduce((a,f)=>a+(f.valor_total_evento||f.itens.reduce((s,i)=>s+Number(i.valor||0),0)),0);
  const totalQbrVal=QUEBRAS_EVENTO_PRELOAD.reduce((a,ev)=>a+ev.total,0)+D.quebras.filter(q=>!QUEBRAS_PRELOAD.find(p=>p.prod===q.prod&&p.data===q.data&&p.qtd===q.qtd)).reduce((a,q)=>a+q.qtd*Number(q.custo||0),0);

  // Valor total do estoque com base na última contagem e preços cadastrados
  const ultimaContagem=D.contagens.length?D.contagens[D.contagens.length-1]:null;
  let valorEstoque=0, valorRevenda=0;
  if(ultimaContagem){
    ultimaContagem.itens.forEach(item=>{
      const preco=D.precos[item.prod]||{};
      const tot=(item.est||0)+(item.salao||0);
      valorEstoque+=tot*(preco.custo||0);
      valorRevenda+=tot*(preco.revenda||0);
    });
  }

  document.getElementById('dash-cards').innerHTML=`
    <div class="card blue"><div class="card-label">Produtos em movimento</div><div class="card-value">${prodComMovimento.length}</div><div class="card-sub">de ${nomes.length} no inventário</div></div>
    <div class="card red"><div class="card-label">Produtos parados</div><div class="card-value">${prodParado.length}</div><div class="card-sub">sem nenhuma saída</div></div>
    <div class="card green"><div class="card-label">Faturamento eventos</div><div class="card-value">R$ ${totalFat.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div><div class="card-sub">${allF.length} eventos</div></div>
    <div class="card amber"><div class="card-label">Custo de quebras</div><div class="card-value">R$ ${totalQbrVal.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div></div>
    ${valorEstoque>0?`<div class="card purple"><div class="card-label">💰 Valor em estoque</div><div class="card-value">R$ ${valorEstoque.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div><div class="card-sub">${valorRevenda>0?'Revenda: R$ '+valorRevenda.toLocaleString('pt-BR',{minimumFractionDigits:0}):''}</div></div>`:''}
  `;

  // Top 10
  const top10=Object.entries(uso).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const maxUso=top10[0]?.[1]||1;
  document.getElementById('dash-top10').innerHTML=top10.map(([nome,qtd])=>{
    const pct=Math.round((qtd/maxUso)*100);
    const cat=MAR[nome]?.cat||'';
    const isCopo=cat==='COPOS/TAÇAS';
    return`<div style="padding:6px 14px;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:11px;font-weight:500;color:var(--text)">${nome}</span>
        <span style="font-family:var(--mono);font-size:11px;font-weight:600;color:${isCopo?'var(--red)':'var(--blue)'}">${fN(qtd)} un</span>
      </div>
      <div style="height:6px;background:var(--border);border-radius:3px">
        <div style="height:6px;width:${pct}%;background:${isCopo?'var(--red)':'var(--blue)'};border-radius:3px;transition:width .3s"></div>
      </div>
      <div style="font-size:9px;color:var(--text3);margin-top:2px">${cat}</div>
    </div>`;
  }).join('')||'<div style="padding:14px;font-size:12px;color:var(--text3)">Nenhum movimento registrado</div>';

  // Consumo por categoria
  const porcatF={};
  nomes.forEach(n=>{if(uso[n]>0){const cat=MAR[n]?.cat||'Outros';porcatF[cat]=(porcatF[cat]||0)+uso[n];}});
  const catSort=Object.entries(porcatF).sort((a,b)=>b[1]-a[1]);
  const maxCat=catSort[0]?.[1]||1;
  const totalCat=catSort.reduce((a,[,v])=>a+v,0);
  const catColors=['var(--blue)','var(--green)','var(--amber)','var(--red)','#8b5cf6','#06b6d4','#f97316','#84cc16','#ec4899','#14b8a6'];
  document.getElementById('dash-cat-chart').innerHTML=catSort.map(([cat,qtd],i)=>{
    const pct=Math.round((qtd/maxCat)*100);
    const pctTotal=totalCat>0?((qtd/totalCat)*100).toFixed(0):0;
    return`<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="font-size:11px;color:var(--text2)">${cat}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--text3)">${fN(qtd)} un (${pctTotal}%)</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px">
        <div style="height:8px;width:${pct}%;background:${catColors[i%catColors.length]};border-radius:4px"></div>
      </div>
    </div>`;
  }).join('')||'<div style="font-size:12px;color:var(--text3)">Nenhum dado</div>';

  // Estoque parado
  document.getElementById('dash-parado').innerHTML=prodParado.length
    ?prodParado.sort((a,b)=>(MAR[b].est+MAR[b].salao)-(MAR[a].est+MAR[a].salao)).map(n=>{
        const tot=MAR[n].est+MAR[n].salao;
        return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 14px;border-bottom:1px solid var(--border)">
          <div><div style="font-size:11px;font-weight:500;color:var(--text)">${n}</div><div style="font-size:9px;color:var(--text3)">${MAR[n].cat}</div></div>
          <span style="font-family:var(--mono);font-size:11px;font-weight:600;color:var(--amber)">${fN(tot)} un</span>
        </div>`;
      }).join('')
    :'<div style="padding:14px;font-size:12px;color:var(--text3)">Nenhum produto parado 🎉</div>';

  // Quebras por evento
  const qbrEvt=QUEBRAS_EVENTO_PRELOAD.filter(ev=>ev.total>0).sort((a,b)=>b.total-a.total);
  const maxQbr=qbrEvt[0]?.total||1;
  document.getElementById('dash-qbr-chart').innerHTML=qbrEvt.map(ev=>{
    const pct=Math.round((ev.total/maxQbr)*100);
    const nomeEvt=ev.evento.length>35?ev.evento.slice(0,33)+'…':ev.evento;
    return`<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="font-size:11px;color:var(--text2)">${nomeEvt}</span>
        <span style="font-family:var(--mono);font-size:11px;font-weight:600;color:var(--red)">R$ ${ev.total.toLocaleString('pt-BR',{minimumFractionDigits:2})}</span>
      </div>
      <div style="height:8px;background:var(--border);border-radius:4px">
        <div style="height:8px;width:${pct}%;background:var(--red);border-radius:4px;opacity:${0.5+0.5*(ev.total/maxQbr)}"></div>
      </div>
      <div style="font-size:9px;color:var(--text3);margin-top:2px">${fd(ev.data)} · ${ev.itens.length} peça${ev.itens.length!==1?'s':''}</div>
    </div>`;
  }).join('')||'<div style="font-size:12px;color:var(--text3)">Nenhuma quebra registrada</div>';
}

// ─── ESTOQUES HISTÓRICOS (MAR / ABR) ──────────────────────────────────────────
function rEst(mes){
  const src=mes==='mar'?MAR:ABR;
  const b=(document.getElementById(mes==='mar'?'mbusca':'abusca').value||'').toLowerCase();
  const cat=document.getElementById(mes==='mar'?'mcat':'abcat').value;
  document.getElementById('tab-'+mes).innerHTML=Object.entries(src)
    .filter(([n,v])=>(!b||n.toLowerCase().includes(b))&&(!cat||v.cat===cat))
    .map(([n,v])=>`<tr>
      <td class="bold">${n}</td>
      <td><span class="badge b-blue" style="font-size:9px">${v.cat}</span></td>
      <td>${fN(v.est)}</td><td>${fN(v.salao)}</td>
      <td class="bold">${fN(v.est+v.salao)}</td>
    </tr>`).join('');
}

// ─── CONTAGENS SEMANAIS ───────────────────────────────────────────────────────
let contView='historico';
function setContView(v){
  contView=v;
  ['historico','nova','comparar'].forEach(x=>{
    const btn=document.getElementById('cv-'+x);
    if(btn)btn.classList.toggle('active',x===v);
    const view=document.getElementById('cview-'+x);
    if(view)view.style.display=x===v?'block':'none';
  });
  if(v==='historico')rContagens();
  if(v==='comparar')rCompararContagens();
}

// Itens da nova contagem em andamento
let contItens={};

function iniciarNovaContagem(){
  // Pré-preenche com zeros para todos os produtos
  contItens={};
  nomes.forEach(n=>contItens[n]={est:0,salao:0});
  rNovaContagem();
}

function rNovaContagem(){
  const busca=(document.getElementById('nova-cont-busca')?.value||'').toLowerCase();
  const catFiltro=document.getElementById('nova-cont-cat')?.value||'';
  const container=document.getElementById('nova-cont-body');
  if(!container)return;

  const prodsFiltrados=nomes.filter(n=>{
    if(busca&&!n.toLowerCase().includes(busca))return false;
    if(catFiltro&&MAR[n].cat!==catFiltro)return false;
    return true;
  });

  container.innerHTML=`
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;background:var(--bg3);border-bottom:1px solid var(--border)">
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Categoria</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Depósito</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Salão</div>
    </div>`+
  prodsFiltrados.map(n=>`
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;border-bottom:1px solid var(--border);align-items:center">
      <div style="padding:8px 14px;font-size:12px;font-weight:500;color:var(--text)">${n}</div>
      <div style="padding:8px 14px"><span class="badge b-blue" style="font-size:9px">${MAR[n].cat}</span></div>
      <div style="padding:6px 10px;text-align:center">
        <input type="number" min="0" step="0.5"
          value="${contItens[n]?.est||0}"
          onchange="contItens['${n.replace(/'/g,"\\'")}'].est=Number(this.value)"
          style="width:70px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
      </div>
      <div style="padding:6px 10px;text-align:center">
        <input type="number" min="0" step="0.5"
          value="${contItens[n]?.salao||0}"
          onchange="contItens['${n.replace(/'/g,"\\'")}'].salao=Number(this.value)"
          style="width:70px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
      </div>
    </div>`).join('');
}

function salvarContagem(){
  const data=document.getElementById('cont-data')?.value;
  const label=document.getElementById('cont-label')?.value?.trim()||'Contagem '+fd(data);
  if(!data){alert2('Informe a data da contagem','error');return;}
  const itens=nomes.map(n=>({prod:n,est:contItens[n]?.est||0,salao:contItens[n]?.salao||0}));
  const novaContagem={id:'C'+Date.now(),data,label,itens};
  D.contagens.push(novaContagem);
  sv('contagens');
  alert2('Contagem salva com sucesso!');
  setContView('historico');
}

function rContagens(){
  const container=document.getElementById('cont-historico-body');
  if(!container)return;
  if(!D.contagens.length){
    container.innerHTML='<div style="padding:20px;font-size:12px;color:var(--text3);text-align:center">Nenhuma contagem lançada ainda.<br>Clique em "+ Nova Contagem" para começar.</div>';
    return;
  }
  const sorted=[...D.contagens].sort((a,b)=>b.data.localeCompare(a.data));
  container.innerHTML=sorted.map(c=>{
    const totalItens=c.itens.reduce((a,i)=>a+i.est+i.salao,0);
    // Calcular valor com base nos preços cadastrados
    let valorTotal=0;
    c.itens.forEach(i=>{
      const preco=D.precos[i.prod]||{};
      valorTotal+=(i.est+i.salao)*(preco.custo||0);
    });
    return`<div class="festa-card enc" style="margin:8px 16px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text)">${c.label}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${fd(c.data)} · ${fN(totalItens)} unidades totais</div>
        </div>
        <div style="text-align:right">
          ${valorTotal>0?`<div style="font-size:14px;font-weight:600;font-family:var(--mono);color:var(--green)">R$ ${valorTotal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div><div style="font-size:10px;color:var(--text3)">valor em custo</div>`:'<div style="font-size:11px;color:var(--text3)">Sem preços cadastrados</div>'}
        </div>
      </div>
    </div>`;
  }).join('');
}

function rCompararContagens(){
  const container=document.getElementById('cont-comparar-body');
  if(!container)return;
  if(D.contagens.length<2){
    container.innerHTML='<div style="padding:20px;font-size:12px;color:var(--text3);text-align:center">Você precisa de pelo menos 2 contagens para comparar.</div>';
    return;
  }
  const sorted=[...D.contagens].sort((a,b)=>b.data.localeCompare(a.data));
  const atual=sorted[0];
  const anterior=sorted[1];

  // Monta select de contagens para o usuário escolher quais comparar
  const selectA=document.getElementById('comp-cont-a');
  const selectB=document.getElementById('comp-cont-b');
  if(selectA&&!selectA.dataset.populated){
    const opts=sorted.map(c=>`<option value="${c.id}">${c.label} (${fd(c.data)})</option>`).join('');
    selectA.innerHTML=opts;
    selectB.innerHTML=opts;
    if(sorted.length>=2)selectB.value=sorted[1].id;
    selectA.dataset.populated='1';
  }

  const idA=selectA?.value||atual.id;
  const idB=selectB?.value||anterior.id;
  const cA=D.contagens.find(c=>c.id===idA)||atual;
  const cB=D.contagens.find(c=>c.id===idB)||anterior;

  // Indexa itens por produto
  const mapA={},mapB={};
  cA.itens.forEach(i=>mapA[i.prod]={est:i.est,salao:i.salao});
  cB.itens.forEach(i=>mapB[i.prod]={est:i.est,salao:i.salao});

  const busca=(document.getElementById('comp-cont-busca')?.value||'').toLowerCase();
  const rows=nomes.filter(n=>!busca||n.toLowerCase().includes(busca)).map(n=>{
    const a=mapA[n]||{est:0,salao:0};
    const b=mapB[n]||{est:0,salao:0};
    const totA=a.est+a.salao;
    const totB=b.est+b.salao;
    const diff=totA-totB;
    return{nome:n,cat:MAR[n].cat,totA,totB,diff,estA:a.est,salaoA:a.salao,estB:b.est,salaoB:b.salao};
  });

  const totalDiff=rows.reduce((a,r)=>a+r.diff,0);
  const comDiff=rows.filter(r=>r.diff!==0).length;

  container.innerHTML=`
    <div class="cards" style="margin-bottom:14px">
      <div class="card blue"><div class="card-label">Produtos comparados</div><div class="card-value">${rows.length}</div></div>
      <div class="card ${totalDiff>0?'green':totalDiff<0?'red':'amber'}"><div class="card-label">Variação total</div><div class="card-value">${totalDiff>0?'+':''}${fN(totalDiff)} un</div><div class="card-sub">${comDiff} produto(s) com diferença</div></div>
    </div>
    <div class="sec">
      <div class="sec-head">
        <span class="sec-title">Comparativo: ${cA.label} vs ${cB.label}</span>
        <input type="text" id="comp-cont-busca" placeholder="Buscar..." oninput="rCompararContagens()" style="width:160px;font-size:11px;padding:5px 9px;border:1px solid var(--border2);background:var(--bg3);color:var(--text);border-radius:var(--radius)">
      </div>
      <table>
        <thead><tr>
          <th>Produto</th><th>Cat.</th>
          <th style="text-align:right">${cA.label}</th>
          <th style="text-align:right">${cB.label}</th>
          <th style="text-align:right">Diferença</th>
        </tr></thead>
        <tbody>
          ${rows.filter(r=>r.diff!==0||r.totA>0).map(r=>{
            const dc=r.diff===0?'neu':r.diff>0?'up':'dn';
            const dt=r.diff===0?'—':r.diff>0?'▲'+fN(r.diff):'▼'+fN(Math.abs(r.diff));
            return`<tr>
              <td class="bold">${r.nome}</td>
              <td><span class="badge b-blue" style="font-size:9px">${r.cat}</span></td>
              <td style="font-family:var(--mono);text-align:right">${fN(r.totA)}<span style="font-size:9px;color:var(--text3)"> (${fN(r.estA)}+${fN(r.salaoA)})</span></td>
              <td style="font-family:var(--mono);text-align:right">${fN(r.totB)}<span style="font-size:9px;color:var(--text3)"> (${fN(r.estB)}+${fN(r.salaoB)})</span></td>
              <td class="${dc}" style="text-align:right">${dt}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─── PREÇOS (CUSTO E REVENDA) ──────────────────────────────────────────────────
let precosView='lista';
function setPrecosView(v){
  precosView=v;
  ['lista','editar'].forEach(x=>{
    const btn=document.getElementById('pv-'+x);
    if(btn)btn.classList.toggle('active',x===v);
    const view=document.getElementById('pview-'+x);
    if(view)view.style.display=x===v?'block':'none';
  });
  if(v==='lista')rPrecos();
  if(v==='editar')rEditarPrecos();
}

function rPrecos(){
  const container=document.getElementById('precos-lista-body');
  if(!container)return;
  const busca=(document.getElementById('precos-busca')?.value||'').toLowerCase();
  const catF=document.getElementById('precos-cat')?.value||'';

  const rows=nomes.filter(n=>{
    if(busca&&!n.toLowerCase().includes(busca))return false;
    if(catF&&MAR[n].cat!==catF)return false;
    return true;
  });

  const comPreco=rows.filter(n=>D.precos[n]?.custo||D.precos[n]?.revenda).length;

  container.innerHTML=`
    <div style="padding:8px 16px;font-size:11px;color:var(--text3);border-bottom:1px solid var(--border)">
      ${comPreco} de ${rows.length} produto(s) com preço cadastrado
    </div>
    <table>
      <thead><tr><th>Produto</th><th>Categoria</th><th style="text-align:right">Custo unit.</th><th style="text-align:right">Revenda unit.</th><th style="text-align:right">Margem</th></tr></thead>
      <tbody>
        ${rows.map(n=>{
          const p=D.precos[n]||{};
          const margem=p.custo&&p.revenda?((p.revenda-p.custo)/p.revenda*100).toFixed(0):null;
          return`<tr>
            <td class="bold">${n}</td>
            <td><span class="badge b-blue" style="font-size:9px">${MAR[n].cat}</span></td>
            <td style="font-family:var(--mono);text-align:right;color:${p.custo?'var(--text2)':'var(--text3)'}">${p.custo?fR(p.custo):'— a preencher'}</td>
            <td style="font-family:var(--mono);text-align:right;color:${p.revenda?'var(--green)':'var(--text3)'}">${p.revenda?fR(p.revenda):'— a preencher'}</td>
            <td style="font-family:var(--mono);text-align:right;color:${margem?Number(margem)>=30?'var(--green)':'var(--amber)':'var(--text3)'}">${margem?margem+'%':'—'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
}

function rEditarPrecos(){
  const container=document.getElementById('precos-editar-body');
  if(!container)return;
  const busca=(document.getElementById('precos-edit-busca')?.value||'').toLowerCase();
  const catF=document.getElementById('precos-edit-cat')?.value||'';

  const rows=nomes.filter(n=>{
    if(busca&&!n.toLowerCase().includes(busca))return false;
    if(catF&&MAR[n].cat!==catF)return false;
    return true;
  });

  container.innerHTML=`
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;background:var(--bg3);border-bottom:1px solid var(--border)">
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Categoria</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Custo unit. (R$)</div>
      <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;text-align:center">Revenda unit. (R$)</div>
    </div>`+
  rows.map(n=>{
    const p=D.precos[n]||{};
    return`<div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:0;border-bottom:1px solid var(--border);align-items:center">
      <div style="padding:8px 14px;font-size:12px;font-weight:500;color:var(--text)">${n}</div>
      <div style="padding:8px 14px"><span class="badge b-blue" style="font-size:9px">${MAR[n].cat}</span></div>
      <div style="padding:6px 10px;text-align:center">
        <input type="number" min="0" step="0.01" placeholder="0,00"
          value="${p.custo||''}"
          onchange="if(!D.precos['${n.replace(/'/g,"\\'")}'])D.precos['${n.replace(/'/g,"\\'")}']={};D.precos['${n.replace(/'/g,"\\'")}'].custo=this.value?Number(this.value):null"
          style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
      </div>
      <div style="padding:6px 10px;text-align:center">
        <input type="number" min="0" step="0.01" placeholder="0,00"
          value="${p.revenda||''}"
          onchange="if(!D.precos['${n.replace(/'/g,"\\'")}'])D.precos['${n.replace(/'/g,"\\'")}']={};D.precos['${n.replace(/'/g,"\\'")}'].revenda=this.value?Number(this.value):null"
          style="width:90px;text-align:center;font-size:12px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);color:var(--text);border-radius:var(--radius)">
      </div>
    </div>`;
  }).join('');
}

function salvarPrecos(){
  sv('precos');
  alert2('Preços salvos com sucesso!');
  setPrecosView('lista');
}

// ─── SELECTS ──────────────────────────────────────────────────────────────────
function populateSels(){
  const co=cats.map(c=>`<option>${c}</option>`).join('');
  ['fcat','mcat','abcat','nova-cont-cat','precos-cat','precos-edit-cat'].forEach(id=>{
    const el=document.getElementById(id);
    if(el&&el.options.length<=1)el.innerHTML+=(id.includes('precos')||id.includes('cont')?'<option value="">Todas</option>':'')+co;
  });
  const fornOpts=D.fornecedores.map(f=>`<option value="${f.nome}">${f.nome}</option>`).join('');
  ['eforn'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<option value="">Selecione ou deixe em branco</option>'+fornOpts;});
  // selects legados (quebras, fi-prod etc.) continuam usando nomes do MAR
  const po=nomes.map(n=>`<option value="${n}">${n}</option>`).join('');
  ['qprod','fi-prod'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<option value="">Selecione...</option>'+po;});
  // #eprod agora é um input com datalist alimentado por D.produtos
  populateEprodList();
}

// Popula o <select id="eprod"> na NF a partir de D.produtos.
// Fallback para nomes do MAR se D.produtos ainda estiver vazio.
function populateEprodList(){
  const sel=document.getElementById('eprod');
  if(!sel) return;
  const prods=(D.produtos||[]);
  const opts=prods.length
    ? prods.slice().sort((a,b)=>(a.nome||'').localeCompare(b.nome||''))
           .map(p=>`<option value="${p.nome.replace(/"/g,'&quot;')}">${p.nome}</option>`).join('')
    : nomes.map(n=>`<option value="${n}">${n}</option>`).join('');
  sel.innerHTML='<option value="">Selecionar produto...</option>'+opts;
}

// ─── ENTRADAS ────────────────────────────────────────────────────────────────
let nfEntItens=[];
function addIE(){
  const prod=document.getElementById('eprod').value;
  const qtd=Number(document.getElementById('eqtd').value);
  const custo=document.getElementById('ecusto').value;
  if(!prod||!qtd||qtd<=0){alert2('Selecione produto e informe a quantidade','error');return;}
  const ex=nfEntItens.find(i=>i.prod===prod);
  if(ex){ex.qtd+=qtd;}else{nfEntItens.push({prod,qtd,custo:custo?Number(custo):null});}
  document.getElementById('eqtd').value='';
  document.getElementById('ecusto').value='';
  document.getElementById('eprod').focus();
  rNFEntItens();
}
function rNFEntItens(){
  const c=document.getElementById('nf-ent-itens');
  const ct=document.getElementById('nf-ent-count');
  if(!nfEntItens.length){
    c.innerHTML='<div style="font-size:11px;color:var(--text3);padding:12px 14px">Nenhum produto adicionado</div>';
    if(ct)ct.textContent='';return;
  }
  const totalNF=nfEntItens.reduce((a,i)=>a+(i.custo?i.qtd*i.custo:0),0);
  c.innerHTML=`<div style="display:grid;grid-template-columns:1fr 80px 90px 28px;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg4);z-index:1">
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</span>
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd</span>
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Custo unit.</span>
    <span></span>
  </div>`+nfEntItens.map((i,idx)=>`
    <div style="display:grid;grid-template-columns:1fr 80px 90px 28px;gap:8px;align-items:center;padding:7px 14px;font-size:12px;border-bottom:1px solid var(--border)">
      <span style="color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${i.prod}</span>
      <span style="font-weight:600;font-family:var(--mono);color:var(--green)">${fN(i.qtd)}</span>
      <span style="font-family:var(--mono);color:${i.custo?'var(--text2)':'var(--text3)'}">${i.custo?'R$ '+Number(i.custo).toFixed(2):'—'}</span>
      <span style="cursor:pointer;color:var(--red);font-size:16px;line-height:1;text-align:center" onclick="nfEntItens.splice(${idx},1);rNFEntItens()">×</span>
    </div>`).join('');
  if(ct){
    ct.textContent=nfEntItens.length+' produto'+(nfEntItens.length>1?'s':'')+' · '+(totalNF>0?'Total: R$ '+totalNF.toLocaleString('pt-BR',{minimumFractionDigits:2}):'sem valores');
  }
}
function limparNFEnt(){
  nfEntItens=[];
  ['enf','eobs'].forEach(id=>document.getElementById(id).value='');
  const ef=document.getElementById('eforn');if(ef)ef.value='';
  document.getElementById('edata').value=td();
  const av=document.getElementById('enf-aviso');if(av){av.style.display='none';av.innerHTML='';}
  rNFEntItens();
}

// ─── VERIFICAÇÃO DE NF DUPLICADA ─────────────────────────────────────────────
function verificarNFDuplicada(){
  const nf=(document.getElementById('enf')?.value||'').trim();
  const av=document.getElementById('enf-aviso');
  if(!av) return;
  if(!nf){av.style.display='none';return;}

  const dups=D.entradas.filter(e=>e.nf && e.nf.trim()===nf);
  if(!dups.length){av.style.display='none';return;}

  // Agrupa por data para mostrar resumo
  const porData={};
  dups.forEach(e=>{if(!porData[e.data])porData[e.data]={forn:e.forn||'',itens:0};porData[e.data].itens++;});
  const linhas=Object.entries(porData)
    .sort((a,b)=>b[0].localeCompare(a[0]))
    .map(([dt,v])=>`${fd(dt)}${v.forn?' — '+v.forn:''} (${v.itens} item${v.itens>1?'s':''})`)
    .join('<br>');

  av.style.display='block';
  av.innerHTML=`⚠ <strong>NF ${nf} já lançada:</strong><br>${linhas}`;
}

function regEnt(){
  const nf=document.getElementById('enf').value.trim();
  const data=document.getElementById('edata').value;
  const obs=document.getElementById('eobs').value;
  if(!data){alert2('Informe a data','error');return;}
  if(!nfEntItens.length){alert2('Adicione pelo menos um produto','error');return;}

  // Confirmação extra na hora de lançar se houver duplicata
  if(nf){
    const dups=D.entradas.filter(e=>e.nf&&e.nf.trim()===nf);
    if(dups.length){
      const dtAnterior=dups.slice().sort((a,b)=>b.data.localeCompare(a.data))[0].data;
      if(!confirm(`⚠ A NF "${nf}" já foi lançada em ${fd(dtAnterior)} com ${dups.length} item(s).\n\nDeseja lançar mesmo assim?`)) return;
    }
  }

  const forn=document.getElementById('eforn').value;
  nfEntItens.forEach(i=>{D.entradas.push({prod:i.prod,data,qtd:i.qtd,custo:i.custo||'',nf,forn,obs});});
  sv('entradas');
  alert2(`${nfEntItens.length} produto(s) lançado(s) com sucesso!`);
  limparNFEnt();
  rEntradas();
}
function rEntradas(){
  const groups={};
  D.entradas.forEach((e,idx)=>{
    const key=(e.nf||'SEM NF')+'|'+e.data;
    if(!groups[key])groups[key]={nf:e.nf||'Sem NF',data:e.data,forn:e.forn||'',obs:e.obs,itens:[]};
    groups[key].itens.push({...e,idx});
  });
  const sorted=Object.values(groups).sort((a,b)=>b.data.localeCompare(a.data));
  const totalGeral=D.entradas.reduce((a,e)=>a+(e.custo?Number(e.qtd)*Number(e.custo):0),0);
  const totEl=document.getElementById('tot-ent');
  if(totEl)totEl.textContent=totalGeral>0?'Total: R$ '+totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
  const container=document.getElementById('lista-entradas');
  if(!container)return;
  if(!sorted.length){container.innerHTML='<div style="font-size:12px;color:var(--text3);padding:14px">Nenhuma entrada lançada.</div>';return;}
  container.innerHTML=sorted.map(g=>{
    const totalNF=g.itens.reduce((a,i)=>a+(i.custo?Number(i.qtd)*Number(i.custo):0),0);
    const totalQtd=g.itens.reduce((a,i)=>a+Number(i.qtd),0);
    const itensHtml=g.itens.map(i=>`
      <div style="display:grid;grid-template-columns:1fr 60px 90px 80px;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:11px;align-items:center">
        <span style="color:var(--text2)">${i.prod}</span>
        <span style="font-family:var(--mono);color:var(--green);font-weight:600">${fN(i.qtd)}</span>
        <span style="font-family:var(--mono);color:var(--text3)">${i.custo?'R$ '+Number(i.custo).toFixed(2):'—'}</span>
        <span style="font-family:var(--mono);font-weight:600;color:${i.custo?'var(--text2)':'var(--text3)'}">${i.custo?'R$ '+(Number(i.qtd)*Number(i.custo)).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
      </div>`).join('');
    return`<div class="festa-card enc" style="margin:8px 16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text)">${g.nf}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${fd(g.data)}${g.forn?' · '+g.forn:''}${g.obs?' · '+g.obs:''} · ${g.itens.length} produto(s)</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:16px;font-weight:600;font-family:var(--mono);color:var(--green)">${totalNF>0?'R$ '+totalNF.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</div>
          <div style="font-size:10px;color:var(--text3)">${fN(totalQtd)} unidades</div>
        </div>
      </div>
      <details>
        <summary style="font-size:11px;color:var(--text3);cursor:pointer;user-select:none;margin-bottom:6px">Ver produtos ▾</summary>
        <div style="margin-top:6px">
          <div style="display:grid;grid-template-columns:1fr 60px 90px 80px;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:2px">
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Unit.</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Total</span>
          </div>${itensHtml}
        </div>
      </details>
    </div>`;
  }).join('');
}

// ─── QUEBRAS ─────────────────────────────────────────────────────────────────
let qView='evento';
function setQView(v){
  qView=v;
  ['evento','lista','consolidado','nova'].forEach(x=>{
    const btn=document.getElementById('qv-'+x);if(btn)btn.classList.toggle('active',x===v);
    const view=document.getElementById('qview-'+x);if(view)view.style.display=x===v?'block':'none';
  });
  if(v==='evento')rQuebrasEvento();
  if(v==='lista')rQuebrasList();
  if(v==='consolidado')rQuebrasConsolidado();
}
function regQbr(){
  const prod=document.getElementById('qprod').value,qtd=document.getElementById('qqtd').value,data=document.getElementById('qdata').value;
  if(!prod||!qtd||!data){alert2('Preencha os campos','error');return;}
  D.quebras.push({prod,data,qtd:Number(qtd),motivo:document.getElementById('qmot').value,custo:document.getElementById('qcusto').value,obs:document.getElementById('qobs').value});
  sv('quebras');['qqtd','qcusto','qobs'].forEach(id=>document.getElementById(id).value='');
  rQuebrasEvento();alert2('Perda registrada!');setQView('lista');
}
function rQuebras(){rQuebrasEvento();}
function rQuebrasEvento(){
  const container=document.getElementById('lista-quebras-evento');if(!container)return;
  const allCards=[...QUEBRAS_EVENTO_PRELOAD];
  const manual=D.quebras.filter(q=>!QUEBRAS_PRELOAD.find(p=>p.prod===q.prod&&p.data===q.data&&p.qtd===q.qtd));
  const totalGeral=D.quebras.reduce((a,q)=>a+Number(q.qtd)*Number(q.custo||0),0);
  let html=`<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
    <div style="font-size:11px;color:var(--text3)">${allCards.length} eventos · ${D.quebras.length} itens de quebra</div>
    <div style="font-size:13px;font-weight:600;font-family:var(--mono);color:var(--red)">Total cobrado: R$ ${totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>
  </div>`;
  allCards.sort((a,b)=>a.data.localeCompare(b.data));
  html+=allCards.map(qe=>{
    const totalEvento=qe.itens.reduce((a,i)=>a+i.total,0);
    const totalQtd=qe.itens.reduce((a,i)=>a+i.qtd,0);
    const temItens=qe.itens.length>0;
    const itensHtml=qe.itens.map(i=>`
      <div style="display:grid;grid-template-columns:1fr 50px 70px 80px;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:11px;align-items:center">
        <span style="color:var(--text2)">${i.prod}</span>
        <span style="font-family:var(--mono);color:var(--text2)">${i.qtd} un</span>
        <span style="font-family:var(--mono);color:var(--text3)">R$ ${Number(i.custo).toFixed(2)}</span>
        <span style="font-family:var(--mono);font-weight:600;color:var(--red)">R$ ${Number(i.total).toFixed(2)}</span>
      </div>`).join('');
    return`<div class="festa-card enc" style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
        <div>
          <div style="font-size:14px;font-weight:600;color:var(--text)">${qe.evento}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${fd(qe.data)}${qe.local?' · '+qe.local:''}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:16px;font-weight:600;font-family:var(--mono);color:${temItens?'var(--red)':'var(--text3)'}">${temItens?'R$ '+totalEvento.toLocaleString('pt-BR',{minimumFractionDigits:2}):'Sem quebras'}</div>
          ${temItens?`<div style="font-size:10px;color:var(--text3)">${totalQtd} itens quebrados</div>`:''}
        </div>
      </div>
      ${temItens?`<details><summary style="font-size:11px;color:var(--text3);cursor:pointer;user-select:none;margin-bottom:6px">Ver itens quebrados ▾</summary>
        <div style="margin-top:6px">
          <div style="display:grid;grid-template-columns:1fr 50px 70px 80px;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);margin-bottom:2px">
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Item</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Unit.</span>
            <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Total</span>
          </div>${itensHtml}
        </div>
      </details>`:''}
    </div>`;
  }).join('');
  if(manual.length){
    html+=`<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px">Quebras avulsas</div>`;
    html+=manual.map(q=>`<div class="festa-card enc" style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between">
        <div><div style="font-weight:600">${q.prod}</div><div style="font-size:11px;color:var(--text3)">${fd(q.data)} · ${q.motivo}${q.obs?' · '+q.obs:''}</div></div>
        <div style="font-family:var(--mono);font-weight:600;color:var(--red)">${q.custo?'R$ '+(q.qtd*Number(q.custo)).toFixed(2):'—'}</div>
      </div>
    </div>`).join('');
  }
  container.innerHTML=html;
}
function rQuebrasList(){
  const tot=D.quebras.reduce((a,q)=>a+Number(q.qtd)*Number(q.custo||0),0);
  const el=document.getElementById('tot-prej');
  if(el)el.textContent=tot>0?'Total cobrado: R$ '+tot.toLocaleString('pt-BR',{minimumFractionDigits:2}):'';
  const mc={'Quebra/Avaria':'b-amber','Vencimento':'b-red','Furto/Desvio':'b-red','Diferença Inventário':'b-blue','Outro':'b-amber'};
  const el2=document.getElementById('tab-qbr');
  if(el2)el2.innerHTML=[...D.quebras].reverse().map(q=>`<tr><td>${fd(q.data)}</td><td class="bold">${q.prod}</td>
    <td><span class="badge ${mc[q.motivo]||'b-amber'}">${q.motivo}</span></td>
    <td>${fN(q.qtd)}</td><td>${q.custo?'R$ '+Number(q.custo).toFixed(2):'—'}</td>
    <td style="color:${q.custo?'var(--red)':'inherit'};font-weight:${q.custo?600:400};font-family:var(--mono)">${q.custo?'R$ '+(q.qtd*Number(q.custo)).toFixed(2):'—'}</td>
    <td style="font-size:10px;color:var(--text3)">${q.obs||'—'}</td></tr>`).join('');
}
function rQuebrasConsolidado(){
  const container=document.getElementById('qview-consolidado');if(!container)return;
  const allQbr=[...D.quebras];
  QUEBRAS_EVENTO_PRELOAD.forEach(ev=>{ev.itens.forEach(item=>{
    const jaExiste=D.quebras.find(q=>q.prod===item.prod&&q.obs&&q.obs.includes(ev.evento));
    if(!jaExiste)allQbr.push({prod:item.prod,qtd:item.qtd,custo:item.custo,data:ev.data,motivo:'Quebra/Avaria',obs:ev.evento+' — '+ev.local});
  });});
  const byProd={};
  allQbr.forEach(q=>{
    if(!byProd[q.prod])byProd[q.prod]={prod:q.prod,totalQtd:0,totalValor:0,eventos:[]};
    byProd[q.prod].totalQtd+=Number(q.qtd);
    byProd[q.prod].totalValor+=Number(q.qtd)*Number(q.custo||0);
    byProd[q.prod].eventos.push({data:q.data,obs:q.obs||'—',qtd:q.qtd,custo:q.custo});
  });
  const produtos=Object.values(byProd).sort((a,b)=>b.totalQtd-a.totalQtd);
  const totalGeral=produtos.reduce((a,p)=>a+p.totalValor,0);
  const totalPecas=produtos.reduce((a,p)=>a+p.totalQtd,0);
  container.innerHTML=`<div style="padding:14px 16px">
    <div class="cards" style="margin-bottom:16px">
      <div class="card red"><div class="card-label">Total de peças quebradas</div><div class="card-value">${fN(totalPecas)}</div><div class="card-sub">${produtos.length} tipos de peça</div></div>
      <div class="card amber"><div class="card-label">Prejuízo total</div><div class="card-value">R$ ${totalGeral.toLocaleString('pt-BR',{minimumFractionDigits:2})}</div><div class="card-sub">custo de reposição</div></div>
    </div>
    <div class="sec">
      <div class="sec-head"><span class="sec-title">Consolidado por peça — todas as quebras do período</span></div>
      <div style="display:grid;grid-template-columns:2fr 80px 100px 100px;gap:0;border-bottom:1px solid var(--border);background:var(--bg3)">
        <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Peça</div>
        <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd total</div>
        <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Custo unit.</div>
        <div style="padding:8px 14px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Prejuízo</div>
      </div>
      ${produtos.map(p=>{
        const cuUnit=p.totalQtd>0?(p.totalValor/p.totalQtd).toFixed(2):null;
        const pct=totalGeral>0?((p.totalValor/totalGeral)*100).toFixed(0):0;
        return`<div>
          <div style="display:grid;grid-template-columns:2fr 80px 100px 100px;gap:0;border-bottom:1px solid var(--border);cursor:pointer" onclick="this.parentElement.querySelector('details').open=!this.parentElement.querySelector('details').open">
            <div style="padding:9px 14px;font-size:12px;font-weight:500;color:var(--text)">${p.prod}
              <div style="margin-top:4px;height:3px;width:100%;background:var(--bg3);border-radius:2px"><div style="height:3px;width:${pct}%;background:var(--red);border-radius:2px"></div></div>
            </div>
            <div style="padding:9px 14px;font-family:var(--mono);font-weight:600;color:var(--red)">${fN(p.totalQtd)}</div>
            <div style="padding:9px 14px;font-family:var(--mono);color:var(--text3)">${cuUnit?'R$ '+cuUnit:'—'}</div>
            <div style="padding:9px 14px;font-family:var(--mono);font-weight:600;color:var(--red)">${p.totalValor>0?'R$ '+p.totalValor.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</div>
          </div>
          <details style="border-bottom:1px solid var(--border)"><summary style="display:none"></summary>
            <div style="background:var(--bg3);padding:8px 14px">
              <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Ocorrências</div>
              ${p.eventos.map(ev=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--border);font-size:11px">
                <span style="color:var(--text2)">${fd(ev.data)} · ${ev.obs}</span>
                <span style="font-family:var(--mono);color:var(--red)">${fN(ev.qtd)} un${ev.custo?' · R$ '+(ev.qtd*Number(ev.custo)).toFixed(2):''}</span>
              </div>`).join('')}
            </div>
          </details>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ─── FESTAS ──────────────────────────────────────────────────────────────────
let nfItens=[];
function addIF(){
  const prod=document.getElementById('fi-prod').value;
  const qtd=Number(document.getElementById('fi-qtd').value);
  const val=document.getElementById('fi-val').value;
  if(!prod||!qtd||qtd<=0){alert2('Selecione produto e informe a quantidade','error');return;}
  const ex=nfItens.find(i=>i.prod===prod);
  if(ex){ex.qtd+=qtd;if(val)ex.valor=(Number(ex.valor||0)+Number(val));}
  else{nfItens.push({prod,qtd,consumido:qtd,valor:val?Number(val):null});}
  document.getElementById('fi-qtd').value='';
  document.getElementById('fi-val').value='';
  document.getElementById('fi-prod').focus();
  rNFItens();
}
function rNFItens(){
  const c=document.getElementById('nf-itens');
  const ct=document.getElementById('nf-count');
  if(!nfItens.length){c.innerHTML='<div style="font-size:11px;color:var(--text3);padding:12px 14px">Nenhum produto adicionado</div>';if(ct)ct.textContent='';return;}
  c.innerHTML=`<div style="display:grid;grid-template-columns:1fr 80px 100px 28px;gap:8px;padding:8px 14px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg4);z-index:1">
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Produto</span>
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Qtd</span>
    <span style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase">Valor</span>
    <span></span>
  </div>`+nfItens.map((i,idx)=>`
    <div style="display:grid;grid-template-columns:1fr 80px 100px 28px;gap:8px;align-items:center;padding:7px 14px;font-size:12px;border-bottom:1px solid var(--border)">
      <span style="color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${i.prod}">${i.prod}</span>
      <span style="font-weight:600;font-family:var(--mono);color:var(--blue)">${fN(i.qtd)}</span>
      <span style="font-family:var(--mono);color:${i.valor?'var(--green)':'var(--text3)'}">${i.valor?'R$ '+Number(i.valor).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
      <span style="cursor:pointer;color:var(--red);font-size:16px;line-height:1;text-align:center" onclick="nfItens.splice(${idx},1);rNFItens()">×</span>
    </div>`).join('');
  if(ct)ct.textContent=nfItens.length+' produto'+(nfItens.length>1?'s':'')+' adicionado'+(nfItens.length>1?'s':'');
}
function limparNF(){
  nfItens=[];
  ['fnome','flocal','fresp'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const fv=document.getElementById('fvalor');if(fv)fv.value='';
  const fd2=document.getElementById('fdata');if(fd2)fd2.value=td();
  rNFItens();
}
function criarFesta(){
  const nome=document.getElementById('fnome').value.trim();
  const data=document.getElementById('fdata').value;
  if(!nome||!data){alert2('Nome e data são obrigatórios','error');return;}
  const valor=Number(document.getElementById('fvalor')?.value||0);
  D.festas.push({id:'F'+Date.now(),nome,data,local:document.getElementById('flocal').value,resp:document.getElementById('fresp').value,status:'encerrada',valor_total_evento:valor||null,itens:nfItens.map(i=>({prod:i.prod,qtd:i.qtd,consumido:i.qtd,retornado:0,valor:i.valor||null}))});
  sv('festas');nfItens=[];limparNF();alert2('Evento salvo!');setFestaView('geral');
}
function _allFestas(){
  const editedIds=new Set(D.festas.map(f=>f.id));
  return [...D.festas,...FESTAS_PRELOAD.filter(p=>!editedIds.has(p.id))].sort((a,b)=>b.data.localeCompare(a.data));
}
function _qbrPorEvento(){
  const map={};
  QUEBRAS_EVENTO_PRELOAD.forEach(ev=>{
    if(!map[ev.evento])map[ev.evento]={total:0,itens:[],data:ev.data};
    ev.itens.forEach(i=>{map[ev.evento].itens.push(i);map[ev.evento].total+=i.total;});
  });
  return map;
}
function setFestaView(v){
  ['geral','produtos','quebras','novo'].forEach(x=>{
    const btn=document.getElementById('fv-'+x);if(btn)btn.classList.toggle('active',x===v);
    const view=document.getElementById('fview-'+x);if(view)view.style.display=x===v?'block':'none';
  });
  if(v==='geral')rFestas();
  if(v==='produtos')rFestaProdutos();
  if(v==='quebras')rFestaQuebras();
}
function rFestaQuebras(){
  const rows=[];
  QUEBRAS_EVENTO_PRELOAD.forEach(ev=>{ev.itens.forEach(i=>rows.push({evento:ev.evento,data:ev.data,prod:i.prod,qtd:i.qtd,custo:i.custo,total:i.total}));});
  D.quebras.filter(q=>q.obs&&!QUEBRAS_PRELOAD.find(p=>p.prod===q.prod&&p.data===q.data&&p.qtd===q.qtd)).forEach(q=>{rows.push({evento:q.obs,data:q.data,prod:q.prod,qtd:q.qtd,custo:q.custo,total:q.qtd*Number(q.custo||0)});});
  rows.sort((a,b)=>b.data.localeCompare(a.data));
  const totalVal=rows.reduce((a,r)=>a+Number(r.total||0),0);
  document.getElementById('tab-festa-qbr').innerHTML=rows.length
    ?rows.map(r=>`<tr><td style="font-size:11px">${r.evento}</td><td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(r.data)}</td><td class="bold">${r.prod}</td><td style="font-family:var(--mono);font-weight:600;color:var(--red)">${fN(r.qtd)}</td><td style="font-family:var(--mono);color:var(--text3)">${r.custo?'R$ '+Number(r.custo).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td><td style="font-family:var(--mono);font-weight:600;color:var(--red)">${r.total?'R$ '+Number(r.total).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td></tr>`).join('')+`<tr style="background:var(--bg4)"><td colspan="5" style="font-size:11px;font-weight:600;text-align:right;padding-right:16px">Total</td><td style="font-family:var(--mono);font-weight:700;color:var(--red)">R$ ${totalVal.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>`
    :'<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:16px">Nenhuma quebra registrada</td></tr>';
}
function rFestas(){
  const all=_allFestas();
  const qbrMap=_qbrPorEvento();
  const busca=(document.getElementById('festas-busca')?.value||'').toLowerCase();
  const totalValProd=all.reduce((a,f)=>a+(f.valor_total_evento||f.itens.reduce((s,i)=>s+Number(i.valor||0),0)),0);
  const totalValQbr=Object.values(qbrMap).reduce((a,v)=>a+v.total,0);
  document.getElementById('festas-cards').innerHTML=`
    <div class="card green"><div class="card-label">Eventos no período</div><div class="card-value">${all.length}</div></div>
    <div class="card blue"><div class="card-label">🍾 Val. produtos</div><div class="card-value">R$ ${totalValProd.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div></div>
    <div class="card red"><div class="card-label">🥃 Val. quebras</div><div class="card-value">R$ ${totalValQbr.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div></div>
    <div class="card amber"><div class="card-label">💰 Total geral</div><div class="card-value">R$ ${(totalValProd+totalValQbr).toLocaleString('pt-BR',{minimumFractionDigits:0})}</div></div>`;
  const rows=all.filter(f=>!busca||f.nome.toLowerCase().includes(busca)||(f.local&&f.local.toLowerCase().includes(busca)));
  document.getElementById('tab-festas').innerHTML=rows.map(f=>{
    const valProd=f.valor_total_evento||f.itens.reduce((a,i)=>a+Number(i.valor||0),0);
    const qbr=qbrMap[f.nome];const valQbr=qbr?qbr.total:0;const valTotal=valProd+valQbr;const uid='fe-'+f.id;
    const detailHeader=`<div style="display:grid;grid-template-columns:1fr 60px 100px 110px 110px;gap:8px;padding:5px 14px;background:var(--bg4);border-bottom:1px solid var(--border)">
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Item</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Qtd</span>
      <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;text-align:right">Val. unit.</span>
      <span style="font-size:10px;font-weight:700;color:var(--green);text-transform:uppercase;text-align:right">🍾 Produtos</span>
      <span style="font-size:10px;font-weight:700;color:var(--red);text-transform:uppercase;text-align:right">🥃 Quebras</span>
    </div>`;
    const prodLines=f.itens.map(i=>{const qtd=i.consumido||i.qtd||0;const vt=Number(i.valor||0);const vu=qtd>0&&vt>0?vt/qtd:null;
      return`<div style="display:grid;grid-template-columns:1fr 60px 100px 110px 110px;gap:8px;padding:6px 14px;border-bottom:1px solid var(--border);align-items:center;background:var(--bg3)">
        <span style="font-size:11px;color:var(--text2)">${i.prod}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--blue);text-align:right">${fN(qtd)}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--text3);text-align:right">${vu?'R$ '+vu.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--green);font-weight:600;text-align:right">${vt?'R$ '+vt.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--text3);text-align:right">—</span>
      </div>`;});
    const qbrLines=qbr?qbr.itens.map(i=>{const custo=Number(i.custo||0);const total=Number(i.total||0);
      return`<div style="display:grid;grid-template-columns:1fr 60px 100px 110px 110px;gap:8px;padding:6px 14px;border-bottom:1px solid var(--border);align-items:center;background:var(--bg3)">
        <span style="font-size:11px;color:var(--text2)">${i.prod}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--red);text-align:right">${fN(i.qtd)}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--text3);text-align:right">${custo?'R$ '+custo.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--text3);text-align:right">—</span>
        <span style="font-family:var(--mono);font-size:11px;color:var(--red);font-weight:600;text-align:right">${total?'R$ '+total.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</span>
      </div>`;}):[];
    const emptyLine=!prodLines.length&&!qbrLines.length?`<div style="padding:10px 14px;font-size:11px;color:var(--text3)">Nenhum produto lançado — clique em ✏️ Editar para adicionar</div>`:'';
    const detailContent=detailHeader+(prodLines.join('')||(!qbrLines.length?emptyLine:''))+qbrLines.join('');
    return`<tr style="cursor:pointer" onclick="toggleFesta('${uid}')">
      <td style="width:24px;font-size:12px;color:var(--text3);text-align:center;user-select:none" id="${uid}-arrow">▶</td>
      <td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(f.data)}</td>
      <td class="bold">${f.nome}${f.local?`<div style="font-size:10px;font-weight:400;color:var(--text3)">${f.local}</div>`:''}</td>
      <td style="font-size:10px;color:var(--text3)">${f.itens.length?f.itens.length+' produto'+(f.itens.length>1?'s':''):'—'}</td>
      <td style="font-family:var(--mono);color:${valProd?'var(--green)':'var(--text3)'};font-weight:${valProd?600:400}">${valProd?'R$ '+valProd.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td>
      <td style="font-family:var(--mono);color:${valQbr?'var(--red)':'var(--text3)'};font-weight:${valQbr?600:400}">${valQbr?'R$ '+valQbr.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td>
      <td style="font-family:var(--mono);color:${valTotal?'var(--text)':'var(--text3)'};font-weight:${valTotal?700:400}">${valTotal?'R$ '+valTotal.toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td>
      <td onclick="event.stopPropagation()"><button class="btn btn-sm" onclick="editarFesta('${f.id}')" style="font-size:10px;white-space:nowrap">✏️ Editar</button></td>
    </tr>
    <tr id="${uid}-detail" style="display:none"><td colspan="8" style="padding:0;border-bottom:2px solid var(--border2)">${detailContent}</td></tr>`;
  }).join('')||'<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:16px">Nenhum evento encontrado</td></tr>';
}
function toggleFesta(uid){
  const detail=document.getElementById(uid+'-detail');const arrow=document.getElementById(uid+'-arrow');if(!detail)return;
  const open=detail.style.display==='none'||detail.style.display==='';
  detail.style.display=open?'table-row':'none';if(arrow)arrow.textContent=open?'▼':'▶';
}
function rFestaProdutos(){
  const all=_allFestas();const busca=(document.getElementById('fp-busca')?.value||'').toLowerCase();const rows=[];
  all.forEach(f=>{f.itens.forEach(i=>{if(!busca||i.prod.toLowerCase().includes(busca)||f.nome.toLowerCase().includes(busca)){rows.push({evento:f.nome,data:f.data,prod:i.prod,qtd:i.consumido||i.qtd||0,valor:i.valor});}});});
  document.getElementById('tab-festa-prods').innerHTML=rows.length?rows.map(r=>`<tr><td style="font-size:11px">${r.evento}</td><td style="font-size:11px;color:var(--text3);white-space:nowrap">${fd(r.data)}</td><td class="bold">${r.prod}</td><td style="font-family:var(--mono);font-weight:600;color:var(--blue)">${fN(r.qtd)}</td><td style="font-family:var(--mono);color:${r.valor?'var(--green)':'var(--text3)'}">${r.valor?'R$ '+Number(r.valor).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td></tr>`).join(''):'<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:16px">Nenhum produto encontrado</td></tr>';
}
function editarFesta(id){
  let f=D.festas.find(x=>x.id===id);
  if(!f){const pf=FESTAS_PRELOAD.find(x=>x.id===id);if(pf){f=JSON.parse(JSON.stringify(pf));D.festas.push(f);sv('festas');}}
  if(!f){alert2('Evento não encontrado','error');return;}
  document.getElementById('edit-id').value=id;
  document.getElementById('edit-nome').value=f.nome;
  document.getElementById('edit-data').value=f.data;
  document.getElementById('edit-local').value=f.local||'';
  document.getElementById('edit-resp').value=f.resp||'';
  editItens=f.itens.map(i=>({...i}));
  const ep=document.getElementById('edit-fi-prod');
  if(ep&&ep.options.length<=1){ep.innerHTML='<option value="">Adicionar produto...</option>'+nomes.map(n=>`<option value="${n}">${n}</option>`).join('');}
  rEditItens();openM('medit');
}
let editItens=[];
function addEditItem(){
  const prod=document.getElementById('edit-fi-prod').value;const qtd=Number(document.getElementById('edit-fi-qtd').value);const val=document.getElementById('edit-fi-val').value;
  if(!prod||!qtd||qtd<=0){alert2('Selecione produto e informe a quantidade','error');return;}
  const ex=editItens.find(i=>i.prod===prod);
  if(ex){ex.qtd+=qtd;ex.consumido+=qtd;if(val)ex.valor=(Number(ex.valor||0)+Number(val));}
  else{editItens.push({prod,qtd,consumido:qtd,valor:val?Number(val):null});}
  document.getElementById('edit-fi-qtd').value='';document.getElementById('edit-fi-val').value='';document.getElementById('edit-fi-prod').focus();rEditItens();
}
function rEditItens(){
  const c=document.getElementById('edit-itens');const ct=document.getElementById('edit-count');
  if(!editItens.length){c.innerHTML='<div style="font-size:12px;color:var(--text3);padding:14px 16px;text-align:center">Nenhum produto lançado ainda — adicione abaixo ↓</div>';if(ct)ct.textContent='';return;}
  c.innerHTML=`<div style="display:grid;grid-template-columns:1fr 80px 110px 28px;gap:8px;padding:7px 14px;border-bottom:2px solid var(--border);position:sticky;top:0;background:var(--bg4);z-index:1">
    <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Produto</span>
    <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Qtd</span>
    <span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase">Valor (R$)</span>
    <span></span>
  </div>`+editItens.map((i,idx)=>`
    <div style="display:grid;grid-template-columns:1fr 80px 110px 28px;gap:8px;align-items:center;padding:7px 14px;font-size:12px;border-bottom:1px solid var(--border);background:${idx%2===0?'var(--bg3)':'var(--bg4)'}">
      <span style="color:var(--text);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${i.prod}">${i.prod}</span>
      <input type="number" value="${i.qtd}" step="0.01" style="font-size:11px;padding:4px 6px;font-weight:600;color:var(--blue)" onchange="editItens[${idx}].qtd=Number(this.value);editItens[${idx}].consumido=Number(this.value)">
      <input type="number" value="${i.valor||''}" step="0.01" placeholder="—" style="font-size:11px;padding:4px 6px" onchange="editItens[${idx}].valor=this.value?Number(this.value):null">
      <span style="cursor:pointer;color:var(--red);font-size:18px;line-height:1;text-align:center;font-weight:300" title="Remover" onclick="editItens.splice(${idx},1);rEditItens()">×</span>
    </div>`).join('');
  if(ct)ct.textContent=editItens.length+' produto'+(editItens.length>1?'s':'');
}
function salvarEdicao(){
  const id=document.getElementById('edit-id').value;const f=D.festas.find(x=>x.id===id);
  f.nome=document.getElementById('edit-nome').value.trim()||f.nome;
  f.data=document.getElementById('edit-data').value||f.data;
  f.local=document.getElementById('edit-local').value;
  f.resp=document.getElementById('edit-resp').value;
  // Empilha: mantém o que já existia e soma/adiciona o que foi editado
  const itensBase=f.itens?[...f.itens]:[];
  editItens.forEach(novo=>{
    const ex=itensBase.find(i=>i.prod===novo.prod);
    if(ex){
      // produto já existe: atualiza qtd e valor conforme o que está no editor
      ex.qtd=novo.qtd;ex.consumido=novo.consumido||novo.qtd;
      if(novo.valor!=null)ex.valor=novo.valor;
    } else {
      // produto novo: adiciona na lista
      itensBase.push({...novo});
    }
  });
  f.itens=itensBase;
  sv('festas');closeM('medit');rFestas();alert2('Evento atualizado!');
}

// ─── RELATÓRIO ───────────────────────────────────────────────────────────────
let relSort={col:'nome',dir:1};
let relFiltro='todos';
function setRelFiltro(f){
  relFiltro=f;
  document.querySelectorAll('[id^="rf-"]').forEach(b=>b.classList.remove('active'));
  const btn=document.getElementById('rf-'+f);if(btn)btn.classList.add('active');
  rRelatorio();
}
function setRelSort(col){
  if(relSort.col===col)relSort.dir*=-1;else{relSort.col=col;relSort.dir=col==='nome'?1:-1;}
  rRelatorio();
}
function rRelatorio(){
  const allF=[...D.festas,...FESTAS_PRELOAD.filter(p=>!D.festas.find(f=>f.id===p.id))];
  const allQbrCopos=[];
  QUEBRAS_EVENTO_PRELOAD.forEach(ev=>ev.itens.forEach(item=>{
    const ja=allQbrCopos.find(x=>x.prod===item.prod);
    if(ja){ja.qtd+=item.qtd;ja.valor+=item.total;}else allQbrCopos.push({prod:item.prod,qtd:item.qtd,valor:item.total});
  }));
  D.quebras.filter(q=>!QUEBRAS_PRELOAD.find(p=>p.prod===q.prod&&p.data===q.data&&p.qtd===q.qtd)).forEach(q=>{
    const ja=allQbrCopos.find(x=>x.prod===q.prod);
    if(ja){ja.qtd+=q.qtd;ja.valor+=q.qtd*Number(q.custo||0);}else allQbrCopos.push({prod:q.prod,qtd:q.qtd,valor:q.qtd*Number(q.custo||0)});
  });
  const totalQbrPecas=allQbrCopos.reduce((a,c)=>a+c.qtd,0);
  const allRowsCards=nomes.map(nome=>{
    const m=MAR[nome],a=ABR[nome];if(!a)return null;
    const totM=m.est+m.salao,totA=a.est+a.salao;
    const isCopo=m.cat==='COPOS/TAÇAS';
    const ent=D.entradas.filter(e=>e.prod===nome).reduce((s,e)=>s+e.qtd,0);
    const fc=isCopo?0:allF.filter(f=>f.status==='encerrada').flatMap(f=>f.itens.filter(i=>i.prod===nome)).reduce((s,i)=>s+((i.consumido||i.qtd)||0),0);
    const qbr=isCopo?(allQbrCopos.find(x=>x.prod===nome)?.qtd||0):D.quebras.filter(q=>q.prod===nome).reduce((s,q)=>s+q.qtd,0);
    const esp=totM+ent-fc-qbr;const diff=totA-esp;
    return{nome,cat:m.cat,totM,ent,fc,qbr,esp,totA,diff,uso:fc+qbr};
  }).filter(Boolean);
  const tiposUsados=allRowsCards.filter(r=>r.uso>0).length;
  const totalTipos=allRowsCards.filter(r=>r.totM>0||r.totA>0).length;
  const diffNegativa=allRowsCards.filter(r=>r.diff<0).reduce((a,r)=>a+Math.abs(r.diff),0);
  const prodComDiffNeg=allRowsCards.filter(r=>r.diff<0).length;
  document.getElementById('rel-cards').innerHTML=`
    <div class="card blue"><div class="card-label">Entradas lançadas</div><div class="card-value">${D.entradas.length}</div></div>
    <div class="card green"><div class="card-label">Produtos utilizados</div><div class="card-value">${tiposUsados} <span style="font-size:14px;font-weight:400;color:var(--text3)">/ ${totalTipos}</span></div><div class="card-sub">tipos com saída no período</div></div>
    <div class="card amber"><div class="card-label">Peças quebradas</div><div class="card-value">${fN(totalQbrPecas)}</div><div class="card-sub">${allQbrCopos.length} tipos de peça</div></div>
    <div class="card red"><div class="card-label">⚠ Diferença não explicada</div><div class="card-value">${fN(diffNegativa)} un</div><div class="card-sub">${prodComDiffNeg} produto${prodComDiffNeg!==1?'s':''} — verificar</div></div>`;
  const relCatEl=document.getElementById('rel-cat');
  if(relCatEl&&relCatEl.options.length<=1){relCatEl.innerHTML='<option value="">Todas as categorias</option>'+[...new Set(nomes.map(n=>MAR[n].cat))].sort().map(c=>`<option value="${c}">${c}</option>`).join('');}
  const catF=relCatEl?relCatEl.value:'';
  const busca=(document.getElementById('rel-busca')?.value||'').toLowerCase();
  let rows=nomes.map(nome=>{
    const m=MAR[nome],a=ABR[nome];if(!a)return null;
    if(catF&&m.cat!==catF)return null;if(busca&&!nome.toLowerCase().includes(busca))return null;
    const totM=m.est+m.salao,totA=a.est+a.salao;const isCopo=m.cat==='COPOS/TAÇAS';
    const ent=D.entradas.filter(e=>e.prod===nome).reduce((s,e)=>s+e.qtd,0);
    const fc=isCopo?0:allF.filter(f=>f.status==='encerrada').flatMap(f=>f.itens.filter(i=>i.prod===nome)).reduce((s,i)=>s+((i.consumido||i.qtd)||0),0);
    const qbr=isCopo?(allQbrCopos.find(x=>x.prod===nome)?.qtd||0):D.quebras.filter(q=>q.prod===nome).reduce((s,q)=>s+q.qtd,0);
    const esp=totM+ent-fc-qbr;const diff=totA-esp;const uso=fc+qbr;
    return{nome,cat:m.cat,isCopo,totM,ent,fc,qbr,esp,totA,diff,uso};
  }).filter(Boolean);
  const filtrosSemSort=['diferenca','zerado','todos'];
  if(relFiltro==='mais-usado')rows=rows.filter(r=>r.uso>0).sort((a,b)=>b.uso-a.uso);
  else if(relFiltro==='menos-usado')rows=rows.filter(r=>r.totM>0||r.totA>0).sort((a,b)=>a.uso-b.uso);
  else if(relFiltro==='diferenca')rows=rows.filter(r=>r.diff!==0);
  else if(relFiltro==='positivo')rows=rows.filter(r=>r.diff>0).sort((a,b)=>b.diff-a.diff);
  else if(relFiltro==='negativo')rows=rows.filter(r=>r.diff<0).sort((a,b)=>a.diff-b.diff);
  else if(relFiltro==='zerado')rows=rows.filter(r=>r.uso===0&&r.ent===0);
  else rows=rows.filter(r=>r.totM>0||r.totA>0||r.ent>0||r.uso>0);
  if(filtrosSemSort.includes(relFiltro)){
    const sortMap={nome:'nome',inicial:'totM',entradas:'ent',quebras:'qbr',esperado:'esp',contado:'totA',diff:'diff'};
    const key=sortMap[relSort.col]||'nome';
    rows.sort((a,b)=>{const av=typeof a[key]==='string'?a[key]:Number(a[key]);const bv=typeof b[key]==='string'?b[key]:Number(b[key]);return av<bv?-relSort.dir:av>bv?relSort.dir:0;});
  }
  ['nome','inicial','entradas','quebras','esperado','contado','diff'].forEach(c=>{const el=document.getElementById('rs-'+c);if(el)el.textContent=relSort.col===c?(relSort.dir===1?' ▲':' ▼'):'';});
  document.getElementById('tab-rel').innerHTML=rows.map(r=>{
    const dc=r.diff===0?'neu':r.diff>0?'up':'dn';const dt=r.diff===0?'—':r.diff>0?'▲'+fN(r.diff):'▼'+fN(Math.abs(r.diff));
    const catBadge=r.isCopo?'b-purple':'b-blue';
    return`<tr><td class="bold">${r.nome}</td><td><span class="badge ${catBadge}" style="font-size:9px">${r.cat}</span></td><td>${fN(r.totM)}</td><td style="color:${r.ent?'var(--green)':'var(--text3)'}">${r.ent||'—'}</td><td style="color:${r.qbr?'var(--red)':'var(--text3)'}">${r.qbr||'—'}</td><td class="bold">${fN(r.esp)}</td><td class="bold">${fN(r.totA)}</td><td class="${dc}">${dt}</td></tr>`;
  }).join('')||'<tr><td colspan="8" style="color:var(--text3);text-align:center;padding:16px">Nenhum produto encontrado</td></tr>';
  const footerEl=document.getElementById('rel-footer');
  if(footerEl)footerEl.textContent=`${rows.length} produto${rows.length!==1?'s':''} exibido${rows.length!==1?'s':''}`;
}

// ─── FORNECEDORES ────────────────────────────────────────────────────────────
let fornView='lista';
function setFornView(v){
  fornView=v;
  ['lista','novo'].forEach(x=>{
    document.getElementById('forn-v-'+x).classList.toggle('active',x===v);
    document.getElementById('forn-view-'+x).style.display=x===v?'block':'none';
  });
  if(v==='lista')rFornecedores();
}
function salvarForn(){
  const nome=document.getElementById('fn-nome').value.trim();
  if(!nome){alert2('Nome é obrigatório','error');return;}
  if(D.fornecedores.find(f=>f.nome.toLowerCase()===nome.toLowerCase())){alert2('Fornecedor já cadastrado','error');return;}
  D.fornecedores.push({nome,tel:document.getElementById('fn-tel').value,contato:document.getElementById('fn-contato').value,obs:document.getElementById('fn-obs').value,criadoEm:td()});
  sv('fornecedores');['fn-nome','fn-tel','fn-contato','fn-obs'].forEach(id=>document.getElementById(id).value='');
  populateSels();alert2('Fornecedor cadastrado!');setFornView('lista');
}
function rFornecedores(){
  const ct=document.getElementById('forn-count');if(ct)ct.textContent=D.fornecedores.length+' cadastrado(s)';
  document.getElementById('tab-forn').innerHTML=D.fornecedores.map(f=>{
    const compras=D.entradas.filter(e=>e.forn===f.nome).length;
    return`<tr><td class="bold">${f.nome}</td><td style="color:var(--text2)">${f.contato||'—'}</td><td style="font-family:var(--mono);color:var(--text2)">${f.tel||'—'}</td><td><span class="badge b-blue">${compras} lançamento(s)</span></td><td style="color:var(--text3);font-size:10px">${f.obs||'—'}</td></tr>`;
  }).join('')||'<tr><td colspan="5" style="color:var(--text3);text-align:center;padding:16px">Nenhum fornecedor cadastrado</td></tr>';
}

// ─── COMPARATIVO DE PREÇOS ───────────────────────────────────────────────────
function rComparativo(){
  const busca=(document.getElementById('comp-busca')?.value||'').toLowerCase();
  const container=document.getElementById('comp-body');if(!container)return;
  const byProd={};
  D.entradas.forEach(e=>{
    if(!e.custo||!Number(e.custo))return;if(busca&&!e.prod.toLowerCase().includes(busca))return;
    if(!byProd[e.prod])byProd[e.prod]={prod:e.prod,compras:[]};
    byProd[e.prod].compras.push({data:e.data,forn:e.forn||e.nf||'Sem fornecedor',custo:Number(e.custo),qtd:Number(e.qtd),nf:e.nf||'—'});
  });
  const prods=Object.values(byProd).sort((a,b)=>a.prod.localeCompare(b.prod));
  if(!prods.length){container.innerHTML='<div style="padding:16px;font-size:12px;color:var(--text3)">Nenhuma entrada com valor lançada ainda. Lance entradas com custo unitário para ver o comparativo.</div>';return;}
  container.innerHTML=prods.map(p=>{
    const custos=p.compras.map(c=>c.custo);const minCusto=Math.min(...custos);const maxCusto=Math.max(...custos);const temVariacao=minCusto!==maxCusto;
    const economia=temVariacao?((maxCusto-minCusto)/maxCusto*100).toFixed(0):0;
    const comprasHtml=p.compras.sort((a,b)=>a.custo-b.custo).map(c=>{
      const isMelhor=c.custo===minCusto;const isPior=c.custo===maxCusto&&temVariacao;
      return`<div style="display:grid;grid-template-columns:1fr 120px 80px 80px 80px;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:11px;align-items:center">
        <span style="color:var(--text2)">${c.forn}</span><span style="font-size:10px;color:var(--text3)">${fd(c.data)} · NF ${c.nf}</span>
        <span style="font-family:var(--mono);color:var(--text2)">${fN(c.qtd)} un</span>
        <span style="font-family:var(--mono);font-weight:600;color:${isMelhor?'var(--green)':isPior?'var(--red)':'var(--text)'}">R$ ${c.custo.toFixed(2)}</span>
        <span>${isMelhor?'<span class="badge b-green">Melhor</span>':isPior?'<span class="badge b-red">Mais caro</span>':'<span class="badge b-neutral">—</span>'}</span>
      </div>`;}).join('');
    return`<div style="margin:8px 16px;border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">
      <div style="padding:10px 14px;background:var(--bg3);display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:13px;font-weight:600;color:var(--text)">${p.prod}</div><div style="font-size:10px;color:var(--text3);margin-top:2px">${p.compras.length} compra(s) com preço registrado</div></div>
        ${temVariacao?`<div style="text-align:right"><div style="font-size:11px;color:var(--text3)">Variação de preço</div><div style="font-size:14px;font-weight:600;font-family:var(--mono);color:var(--amber)">${economia}% de diferença</div><div style="font-size:10px;color:var(--text3)">R$ ${minCusto.toFixed(2)} → R$ ${maxCusto.toFixed(2)}</div></div>`:`<span class="badge b-neutral">Preço estável</span>`}
      </div>
      <div style="padding:0 14px">
        <div style="display:grid;grid-template-columns:1fr 120px 80px 80px 80px;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Fornecedor</span>
          <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Data / NF</span>
          <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Quantidade</span>
          <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Custo unit.</span>
          <span style="font-size:9px;font-weight:600;color:var(--text3);text-transform:uppercase">Status</span>
        </div>${comprasHtml}
      </div>
    </div>`;}).join('');
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
var pageInfo={
  fechamento:['Dashboard','Visão geral de movimento, giro e inventário'],
  'est-mar':['Contagem 30/03/2025','Fechamento de março — 206 produtos'],
  'est-abr':['Contagem 28/04/2025','Fechamento de abril — 206 produtos'],
  contagens:['Contagens Semanais','Histórico e comparativo de contagens'],
  precos:['Preços','Custo e revenda por produto'],
  entrada:['Entrada de produtos','Registrar compras e reposições do período'],
  festas:['Festas / Eventos','Eventos realizados no período'],
  relatorio:['Relatório de conciliação','Esperado vs. contado — identifica diferenças'],
  contratos:['Contratos','Gerar contrato a partir da proposta PDF'],
  analise:  ['Análise','Indicadores e distribuição de eventos'],
  produtos:['Produtos','Cadastro de produtos, embalagens e aliases'],
  regras:['Regras e Cálculos','Fichas de coquetéis e regras de proporção'],
  producao:['Produção','Folha de produção do evento'],
  separacao:['Folha de Separação','Geração automática da folha de separação'],
  agenda:['Agenda Operacional','Visão geral dos eventos por período'],
  financeiro:['Financeiro','Parcelas e status de pagamentos'],
  despesas:  ['Análise Financeira','Receita, despesas e KPIs financeiros'],
};
// pageRenders como função para evitar referência antecipada
var pageRenders={};
function initPageRenders(){
  pageRenders={
    fechamento:rFechamento,
    'est-mar':()=>rEst('mar'),
    'est-abr':()=>rEst('abr'),
    contagens:()=>setContView('historico'),
    precos:()=>setPrecosView('lista'),
    entrada:rEntradas,
    festas:()=>setFestaView('geral'),
    relatorio:rRelatorio,
    contratos:()=>initContratos(),
    produtos:initProdutos,
    regras:initRegras,
    producao:()=>setProdView('lista'),
    separacao:initSeparacao,
    agenda:rAgenda,
    financeiro:rFinanceiro,
    despesas:rDespesas,
    analise:rAnalise,
  };
}
function go(page){
  if(page==='nova-festa'){go('festas');setFestaView('novo');return;}
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const pageEl=document.getElementById('page-'+page);if(!pageEl)return;
  pageEl.classList.add('active');
  const items=[...document.querySelectorAll('.nav-item')];
  const map={fechamento:0,'est-mar':1,'est-abr':2,contagens:3,precos:4,fornecedores:5,entrada:6,comparativo:7,festas:8,relatorio:9};
  if(items[map[page]])items[map[page]].classList.add('active');
  const[t,s]=pageInfo[page]||['',''];
  document.getElementById('ptitle').textContent=t;
  document.getElementById('psub').textContent=s;
  pageRenders[page]&&pageRenders[page]();
}
function alert2(msg,t='success'){
  const el=document.getElementById('alertbox');
  el.textContent=msg;el.className='alert alert-'+t;el.style.display='block';
  setTimeout(()=>el.style.display='none',3000);
}
function openM(id){document.getElementById(id).classList.add('open')}
function closeM(id){document.getElementById(id).classList.remove('open')}
function init(){
  initPageRenders();
  const now=new Date();
  document.getElementById('tdate').textContent=now.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  document.getElementById('nav-date').textContent='v2.0 — '+now.getFullYear();
  ['edata','qdata','fdata','cont-data'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=td();});
}
function imprimirRelatorio(){
  const agora=new Date().toLocaleString('pt-BR');
  const catF=document.getElementById('rel-cat')?.value||'';
  const busca=document.getElementById('rel-busca')?.value||'';
  const filtroLabels={'todos':'Todos os produtos','mais-usado':'Mais usados','menos-usado':'Menos usados','diferenca':'Com diferença','positivo':'Sobra','negativo':'Falta','zerado':'Sem movimento'};
  const filtroLabel=filtroLabels[relFiltro]||'Todos';
  const tbody=document.getElementById('tab-rel');if(!tbody)return;
  const linhas=[...tbody.querySelectorAll('tr')].map(tr=>{
    const tds=[...tr.querySelectorAll('td')];if(!tds.length)return null;
    return{nome:tds[0]?.textContent?.trim()||'',cat:tds[1]?.textContent?.trim()||'',inicial:tds[2]?.textContent?.trim()||'',entradas:tds[3]?.textContent?.trim()||'',quebras:tds[4]?.textContent?.trim()||'',esperado:tds[5]?.textContent?.trim()||'',contado:tds[6]?.textContent?.trim()||'',diff:tds[7]?.textContent?.trim()||'',diffClass:tds[7]?.className||''};
  }).filter(Boolean);
  const infos=[`Filtro: ${filtroLabel}`,catF?`Categoria: ${catF}`:'',busca?`Busca: "${busca}"`:'',`${linhas.length} produto${linhas.length!==1?'s':''}`,`Impresso em: ${agora}`].filter(Boolean);
  const html=`<div class="print-title">Controle e Gestão — Relatório de Conciliação</div>
    <div class="print-sub">Contagem 30/03 → 28/04/2025</div>
    <div class="print-info">${infos.map(i=>`<span>${i}</span>`).join('')}</div>
    <table><thead><tr><th>Produto</th><th>Categoria</th><th>Inicial (Mar)</th><th>+ Entradas</th><th>- Quebras</th><th>Esperado</th><th>Contado (Abr)</th><th>Diferença</th></tr></thead>
    <tbody>${linhas.map(r=>`<tr><td><strong>${r.nome}</strong></td><td>${r.cat}</td><td>${r.inicial}</td><td>${r.entradas}</td><td>${r.quebras}</td><td><strong>${r.esperado}</strong></td><td><strong>${r.contado}</strong></td><td class="${r.diffClass}"><strong>${r.diff}</strong></td></tr>`).join('')}</tbody></table>`;
  document.getElementById('print-area').innerHTML=html;window.print();
}

// ─── TEMPLATE DO CONTRATO (MODELO_CONTRATO.docx em Base64) ───────────────────
window.TEMPLATE_B64_GLOBAL = "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mXmofE34Vsl1qFzdXtn0kM7+egr6kSMLEqdMehqtqmmQavp01ncxJPbzIUeOQcH2rgfDMvZ+0hi58/qdq4gXtPZzw1P2fa2pynww+INj8RtHS7hHkXkX7ue3PVDXbooA2jnFfK3wlmfwL8abnRA7i2eeS1Of4/8AnnX1Svyg+tepw/mE8fhX7f44PkZ5ueYCngMV/s/8Oa518xCygZPApytv57V4d+0b48k0awt9BsZzHe3Q3SFOqR+teg/CqDV7bwTYHWrp7nUZE3vv/g/2K7MPmtPEY2pgacPg6nPUy6pQwVPGVPt7Ha0UmaMg96948sWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAaFx7VGzIp5Kj8ad95SAa8P8Z/Djx/qviK/u9N19bfT53DwQi6dDH+AjNeZjsVUwtPnp0+c7cJh6eInyVKih5s9w3L7Ubl9q+d/+FSfFH/oZk/8ABhN/8RS/8Kk+KP8A0Myf+DCb/wCIrwP7cxn/AEAz/A9f+ycJ/wBBkPx/yPofcvtRuX2r54/4VJ8Uf+hmT/wYTf8AxFH/AAqT4o/9DMn/AIMJv/iKP7cxn/QDP8A/snCf9BkPx/yPofcvtRuX2r54/wCFSfFH/oZk/wDBhN/8RR/wqT4o/wDQzJ/4MJv/AIij+3MZ/wBAM/wD+ycJ/wBBkPx/yPofcvtRuX2r54/4VJ8Uf+hmT/wYTf8AxFH/AAqT4o/9DMn/AIMJv/iKP7cxn/QDP8A/snCf9BkPx/yPofcvtRuX2r54/wCFSfFH/oZk/wDBhN/8RR/wqT4o/wDQzJ/4MJv/AIij+3MZ/wBAM/wD+ycJ/wBBkPx/yPofcvtRuX2r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fSmpzn0Vh5dhJ5HQrYzF+5eDhBdW2e9PHvQj1XFfKej35+GPxtuTf4jtJZnRpT02Scivq/8AgBHavN/ir8JLT4i2sc8T/Y9Tg5jmX+P/AGH9RX0Of4Gvi6dOthf4lN83qeJkuNo4epUoYn+HUVn5eZ21xcOmmyzWUaXThd8Uat96vDvBn7QN3p/iPVLLxhGbZPNfZhP9Rj/lmawdOsviz8O1GnWUFzc2sf8Aq9kYuErH1j4e/EL4g30+q6npbi4jjwPMjjt/Mr5TMc6x9ZQqYSnUhUhvDk9x/M+pwGTYLD+0p4upTnTntPn99fI1fgxby+OPi5ea/NH+5WSS6x/c/wCedfTGr6rDoumXN9cv5dvAm939BXhv7Md5LHBqely6ZJEY33NdlOM/3H966f8AaUv5bD4ayRxdLu6iif8ADMn/ALTr1MlqvL8iqY5+/UfPP5nm5vD67nMMH0XJBenc8t8AaddfF34qTa3ep/ocEnnvGf8AyGlfVCxjBx0xivL/ANnjRbbTPh7b3MQzJdO8jv8AjXqGcKWHGRmvW4Zwro4H6xU+Or77+Z5fEGK9vjPq8Pgp+4vkcf8AEzxoPBPhe4vhzNt2xJ6v2rlfgD4p8QeK9HvLnV2+0WqOEt7h0w8mPv5/GvOPjP4km+IXj6z8N6XIJI4JPIJA/j/j/Svobwn4etfC/h+y0y1GIIYgg4+9WGDxeIzTNqlSnO2Hoe5/jn/wDoxWHpYDK4QnD97U19EdCMdqDiql5dx2Nu0srrHGg3O79BWd4Y8W6X4w0/7Vpd1HdW+7ZuU19j7Wnz+zvqfLKnNw50tDdopM0ZrYgWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACkpaKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACikpaACkPSlpD0NAHzD+0Xp8+geONL15P9XIiGMf9NEJ/+11774W8SWvirw/ZalZMJbeeMOOfu1T8deB7Lx74fk0y74/iSXuj9q+dF0vx58F7+RbFJLmwd84iTfC39RX5zXliMgzOpi+R1KFfe32D7WjTpZ3gKeH51CvT79UfV+QQMDcMn8K+e/jn8Qb0eL9L0fQLyaK7tyfMNu/V36Iaxbv40fEDxLF9gsNOjtnk/wCWlrBIZP1rsfhF8FJdEv8A+3vETCTUSd0duTv2H++59ajFZnVz1rCZdTmqd/fnsaYXLqeS3xeYNN29yG9/XyPZNIilg0q1iuJGlmWJA8j/AMbY5/WsPXvh34f8Rzie+0i1uLjtKYtr/n1rrQAAQOlRn/exX3lTD0501CrDn9T46FapCbnB29Dl9F+Gnhvw/N59npNrFOf+Wgj3GupGFGAuB7UiAnvzSkHu1PD0KVBclKnyGdStUrvmqTuSUYoFLXYZiEA9RQQMdKWilZAU4LSC0V/JiSLe+99i4ya534g+C4/HPhi700uY3kG6OT+446Gur2jbim7dveuSvhqdek6E17jNIVqlGoqsHqj5R8GfEDW/glqM2i67pskloH8zYPT+/HXW+L/2mbeXS5IdAtphdPHxNOOI/rXtmueHNN8Q23kalYwXsf8AduE31h6Z8JvCej3X2u00W1iuT/y0Zd5/Wvio5LmuFh9UwuL/AHf/AJOj66WbZbXn9ZxWH/eeXwM81/Z8+HV1aGbxHrETpcXH+qjl+/8A75+te4Xuo22lWklzdSpbwRrvd3OMCodU1G00OwkurydILeEb2ZzgCvmLxt421v4x+Il0TQ1dNNL/ACr/AHx/ff2ronXw3DOEhhKHv1H06zZlTo1+IsXPEVfcprd9EvIm+IPxF1b4sa6nh3w8jmx8zyzH2mH99/aqklh4m/Z88R292M3mnXA+fZ9yY/8APP60nhXU9R+AfjKS11eyjks7j78iDon/AD0R/wClfSWp6bpHxF8OBZgl7p13HvRl6H6GvlcDgqmce0xFSv7PFw6fyH0mOxkMr9nh6VO+En1/n87i+E/Ftj4w0O21HTZRKjjlCeUfuprfUL83v1r5i0nw/wCKvg/8Rbey0+GW+0++kzs/5ZzJ/wCySV9Ox/MAemRzX6DlGY1cbS5K8OSpDSfr/wAE+FzTBUsJV58PPnpz1RMKWkpa+iPICiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKQ0tJQAxTkHFDHA55FYHivxlpfgywNzql3Hbx/wACk/O59hWjpOpQ6tYw3Ns4lgmTejjuK51XpOfslNc3Y0dKah7RrQ0RS0lLXQZiUFQeoB/ClopWT3AjWBE52j8qfgUtFCSWw7hSYpaKYgpMUtFABRRRQAUUUUAFFFFACUEcUtIelAHn/wAWfh+3xA8M/Zobt7a5h/eQ8/u3Po9eL/BLxdD8OvEV3oOu20dm9w/l/aJE/eI/9x/9j0r6hMZIX5uB1rzT4wfCe38f6cLuzVLbW7f/AFcoHEg/uP7V8RnWUzdenmmB/j0+n867H1OVZlD2DyzF/wAOfX+R9zovHngHTviHojWt0u2TGYbmP76H2Nea/A3w34t8HeINQ0m/gI0SEYDMfk3/APTP2qt8DfiFqsOoHwlrFtPI9uNiS7P9X/sP7177yBktwa0wtLC5zUpZpRThUho/1iycXVxWU06mWVLTpy26/NEmBjkVDNNHbpuZ1jX1JpzE5Ve9eMftH+H7+/8ADUGq2s85isX3TW6PhMf3z9K97McXPAYWeIhDnceh42BwsMZiIYec+TnPaflIBzx60/rXnfwZ8Zf8Jr4LgnkbN1bnyZvYivQS+N3tXRhMXTxlCniKe0zDFUKmDxFTD1N4ElLSClrtMAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK+a/F/7KgitNa1WP4qfEaJhHcXcdvH4gkEUZ+/ivLv2XvghqXxo+D+meKta+KnxDttSubi4jkjtvEMnl/u5DH/SgD7lorn/BfhgeDvC+n6N/aV/q/wBjj8v7bqc/m3Enu7966CgAoorzmx+LtjffGzUvhtHY3UWpWOkJrD3p2eVJH5iJ5Y9/3g/WgD0aiiviv4Q/CfUfjzqfxJ1/UfiR440aK28X6jp1lY6RrckUMUUcn/PP/tpQB9qUV4p8Pv2bv+EA8U2mt/8ACxfHOvm33j7Fq2syXFtJn++h61xPx+0bUviB+0V8O/BNt4p13wvptzpl7e3cmiag9tI/l/6vp75oA+oaK+c/+GN0/wCit/Ev/wAKCSve9JsP7M0y1s/PlufIjSPzbh98r8dXPrQBo0Vn6nbf2lYT2pmkt/PjdPNjfY6e4r5r8XfszaP4I8OXmua78aPiPZaVaR+ZcXMviGTpQB9SUV8h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n27RRRXSdAUUUUAFFFFABRRRQAUh5BpaQ9KAPk/xl4esG+Pn2LUUEljfXMe6Pfxhxx/5Er07x18JvDeleANXaw0eCO6jg8xZFTdJXCftBwHQ/iXoWqL3jjk/74kr6D1i3+36JdW6j/X27R/mlfmGXYHD1K2YUKlP95zv/wAmR9/jsdiIU8vxEKmll/5K0eU/swXKXPhC9tnRA9vdAEDv8lcf8cYf7H+KejX4cRRvGjf+RK2P2Z4Lux1PxBaT286RSLE6vImI96cVa/ad0Oe+i0O6tIJLmRTJH5ccfmdq5Z051+GYSt+8g+3987oShR4kqRb0mn+MDK074keOPh/4kttH1az/ALVtrmTZA8nHmf7j/wCNfRkeCQx+8Rmud0W1tvEHh/SLrULI/aEjjl8udPnjkxXS4HIHBxX2+U4XE4SE1Uqc8NOQ+IzHE0sRUXJTUJr4rbMlopKWvojyQooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK+Qr3Rpf2r/wBoTxFpOtTz/wDCtfAskdv/AGdHJsi1C96/vPUCvr2vlL9mm/g+H3x/+L/gLUv9F1G/1T+3tP8AN6XFvJ/zzoA94k+EHgaXQ/7Gk8I6EdJxs+ynT4/L/LFZHwg+BOgfBKbXE8OS30Wnapcfaf7OuJ99van0jB6V6ZVaO6gmlkiSRHeP76A/coAs0UUUAcL8ZdfvvCnwo8WaxpUwt9R0/S7i5t5TH5nlukZI4qH4GeI9R8X/AAa8F65rMwuNV1DS7e6uJdnlh5HjBPH414V8dv2VPC2i/DXxn4gj13xVLcwWFxeeXLrEkkXmYz/q6rfAP9k/wt4m+EHgfXbj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UUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAN4ArN1HRbHWDbm9tY7jyJPMj8wZ2PWkKazY4rGdJVFaYc7hqhBwvQVgeJvGekeEbE3Oq3scEePlBPzMa4f42fEPXPBFnaQ6NZJK92fL+2P84jft8nevMvC/wZ8S/EO+/tTxPfTW9s4/5eOJn/4B0FfI5jnWIpV/qGX4dzqd/sI+lwOVUqlH63jqvJT/ABZf8U/tA614quv7K8J2U9uZPkSTy987/QVp/Cj4Ka5aeIYPEPiC+lt7tH8zyEfe0n/XQ16x4T+Hmh+CIPL0mzWJ8fvJ5BmR/q9YnxJ+Mmk/DuWO3kSS81CUbxbxfwD1f0rzlln1a2Z57iOdw6fYXyPReYe2vl+S4fSfXeb+fQ9HHHFIRz0zXh/hz9pvTdSvo7fVbCTSzJ/y0Z98f5ivZLW4i1GBJoJFeN/mVl6GvrsBmWEzKHPhKnOfM43L8XgHbEU7XL4paQUteueeFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFJmgBaKTI9aWgApMUtFAFC60uzv57eee1jlng+eGSROYzV7AHalopWS1HdsKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoorn/APhO/Df2z7L/AMJBpX2n/nn9sj3/AJZoA6CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiqN7qdpp4j+13UNuZDsj82TZvNAF6iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAKk1tFc7DJGkpU7k3joanACjgAUtUtVEx0u7+yOI5/Kfy39Hxx+tYO1JORory0LC4Yk9+4r5O1qyt3/aBuIdfiWW2e+ziTps/5Z/+067/AOAnxD1fxHrOqWOt3jz3Eab443GMCqH7Sng3zI7LxRaxgSwjyZyO6fw/rX5znFaGbZVDHUIX9nPncO9u/wCZ9tldF5ZmU8DidHUhZP1Wh2/xL+EOleMdEYWlpBZ6lBF/o8kUYTj+7xXIfs0eMLqcaj4bvnMhtPmh3jlP78f4GvQfhH4oPjHwNY3lwd9zEDBM39504Nc34K+DF54X+Ilz4ie+ie2nedvs6DH3/wD9VehLDueKweZZfTtz/H/gOSGI5MJicux8/g+D1PZKKbuAHJAoDqejA/jX3l13PkB1FJkUZFMBaKTNGaAFopM0UALRRSUALRSZpaAEJGKbkHpmg8rWP4i8S2XhbS59Qvphb2kAyzmsalSFOHPMqEJ1J8kCbUtUt9Ismu72aO3toxulkkOMV82eMP2iNWvPEMD6CXg0u1k58zgT+z+lQa5rniH4/wDiM2GlQSW2jxvjP8Cf7cle16F8IPD+geEptHkgS5SaMi6nk+/Ifc1+d4jF5hnzcctn7OhT+3/P5H3OHw+AyRKePXtak/sfyefqafgDxxY+PtCjv7NwJAMSw55R+4NdaAK+MNN8Tf8ACqvHk76LeLfaerhJFjPyTJX1r4U8T2Pi/Q4NRsJhLBKOo/hr2MgztZlD6vXf76G/n5nk5xkzwE1iKa/dz28vJm9RSClr7I+aCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiii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8DdY8Z6peap4xmurb5+Y84eYe9fSqr5cWC2fenKCqH5ufWvoMZk1HHzpyr/BD7HQ8TC5tiMDCpCho5/b6nll5+zn4NuLUwJaTW8pHEsczg/zrxy4j1v4B+Notk0txp0nY/cmT/GvrZRkckMK8Q/aktIH8MabO4/fpdbYz7lDXzmfZPhcLhfr+EhyVKfY93I80r4jFfU8ZP2lOpprqexaff2+saZbXMJEttcRh0OOqmvMvHf7PmjeKGkutPP9kXxGQ0Q/dt9U6VufBKR2+GujmTuj/wDob13N9dpZ2U8z8JGhY19I6OHzbAQqYun8a/Q+fjWr5djJww0+tvxsfDupJqHhfxTFaag/9pPpM+fLL746+pfAHxj0HxvEkAmFjqRABtLjgn/d9a8q+AWlReL/ABtrur38PmRvHIBHIm+M75M/0rpfHX7N8F9PJeeGphp1x/zwb/VGvznJMPmWCpVMwwH7ynN/B6M+7zirgMbWjgsZ+7qQXx9Ltdj3FGz02n6Gs3xLo/8Abui3lgJ5Lb7RH5fmRH50rzH4Q6X4/wBNk+z695Y06P5czyF5z/u47fWvYm5Pav1LDYh47D89Sk4eUj89xND6jX5IVFO3VHlHwu+B9v4Kn/tHUXW/1b+GUj5U+lesr+lJjYOeaVWDe1a4PA0Mvpeyw8LIjFYuvjqntq7uySiiivQOQKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK+Tf27f2ivGf7P0XgyXwpNaR/2o14Lg3Nv5o/d/Z/LH/kSSuG+B37XXxF+NPxk8NWFlpMtv4HjjRNTvUsM+ZJ9n/eSSSf8s/3lAH3XRXwn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v1POzeH13OYYPouSC9O55J4Hsbj4x/FibV71M2EEnnvGf4E/5Zx19WiNdpAOBjFeV/s7aBb6Z8P4btebi8keR39x8v8ASvVM/KSO4zXrcM4X2OB+sVPjqe+/meXxBivbYv6vD4KfuL5HJfEfxkngTwzPqHWUDZCh/jfsK5D4DeLfEPi/SL281h0uLNH8qG424eRu9ed/G7xDP498dWXhjSyJI4JPIP8A10r6I8JeGrfwn4dstLtseTBGEH+1XLhcXiM0zicqc7Yehp/jn/wDpxWGoZflVOFSH72pr6QN1aU4qpdXEdlCzu6xovzu79KzvDfi3S/Flh9q0u7jvbffs3RnivtPa0/aezvqfKqnNw50tDdopM0tbEBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSYpaKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooASloooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKSigBaQ9KWkPQ0AfMP7RdhPoPjjS9fXlHVPLH/TRDn+te++FfEtr4q0Cy1KyYS286Bxz92qXj3wPZ+O9Ak026OzHzRz90f1r50Sz8efBO/kjgSSXT3k7Jvgb+or85ryrZBmdTF8jqUK+9vsH21GnSzvAU8PzqFen36o+sMgquFzzXz98cfiLqEXivS9H8P3ksV1Af3/2d+rv0Q1g3fx18c+JIvsGn6WltNJxvtIZJHrsPhH8FLrTNQHiHxMRJft86W8h34f8A56P71GJzWpnjWDyxTSv707WLwuXU8lvi8xabt7kN7+vkeyaMs6aZaR3h8yZI0Due7Y5rD8Q/DXw14pnFxf6VBJcf89Nu1/zrrF/3qGB/vYr72rh6dSmqdWHP6nxsMRUpzdSm+T0OQ0P4YeGPD0xntNIgSY/xuN5/N811/wB3otCsTmjBHVqMPh6GHXJRp8hFStUrvmqTuSUYoHSlrsMxCoPUCjAA6UtIaVkBStrK3shIYYUg8x98nlpje3rXN/EfwSnjjwteaazmN5F3Qyd0cdDXXBcDFG3HTpXJXw1OvSdCa9xm9OvOjUVSD1R8qeCPiLrHwY1GfRdc06WSzD+YEH8A/wCmddZ4u/aZsf7Mki0G2lkvHj4eYY2fWvadd8L6V4mtvJ1Swhvo/SVa5/TfhD4T0i4E9vo1ukp7yDf/ADr4mOT5xhaf1TC4j91/5OfWTzXKcVP6zisO/a+XwM83/Z8+HFxDJP4p1mNzc3HEIm++f9uvc7zUILCKWW4kSCCNd7u/AAqLUNQttG06W6uZYoLeBS7u/AQV8xeO/iDrHxi19NC8PQMbHf8AKv8AfH99/aumdfDcMYGGHp+/UfTrNmNOhX4jxk8RU9ymt30giz8SPiZq3xV1qPw14bWQ2Eknlkx9J/8Arp/0zrO+x+JP2ffEltPIPtOnTx/PsHyTH/nn9aPCOpX3wG8ZSWutWSPBcfI8qDon/PRH/pX0fq2laN8Q/DQin2Xlhdx70dOh9GBr5XBYKpnHtMXUr8mLh0/k+R9JjcZTyv2eHp074SfX+fu7lnwt4ssfF+i2+p6awmgkHb+Gt0SDJGOnWvmDR9J8U/Br4hQadZRzahp18/yKD+7mj/8AjlfTQxs544BJr9AyfMauOp8mIhyVIaSPhs1wVPB1efDz56c9Yf8ABLNFIOgor6M8cWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKQ0tJQA0YAoOCKwvE/izS/B9ibrU7uO2j6Lk/Mx9AK0NO1GDVbOG5gcSQTJ5iOO4rn9vTdT2afvGns5qHPYv0tIKWugzEoKg9QD+FLRSaT3Aijt4o/uxKv4VJgelLRQklshtt7iYopaKYgpKWigAooooAKKKKAEpaKKAEoI4paQ9KAPP/i34Afx94ZNtDdyW1zB+8jTf+7k9n9q8X+CXi62+HviS70HWrZLOe4fyzdyJ+8R/7j/7HpX1CYyQvzcDrXmHxm+EsHjvTxe2Kpba3b/6uUD/AFo/uGviM6ymbrU8zwX8an0/nXY+qyrMoeweWYv+HPr/ACM6P4g+ANN+Imita3A2TYzBcR9UNeafAzQvF3hLxHqGjX9vnR4R88r/AHC//TOovgh8RtUg1E+Etbtp3ngGyKXy/uD+4/vXvuOMk5BrTC0sLnVSnmtH3KkN+nrGZOKq4rKadTLKlp05bdfmh+0MvIBqGWRLdN7sEX1Y04ttIQfnXjX7SOhalfeGrfUrG6n8q1fM0Eb4TH98/SvezHFzwGFniIQ5+XoeLgcKsZiIYec+TmPZ9wG0jkUqoQW968/+DXjQ+NfB8E0jA3UH7qb2YV6CrcGujCYuni6FPEU9pmOJw9TCV6lCpuiSiiiu05wooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKK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KiDe/wBa0CRjnihuBXgHxe+L/iLS/ET+HtF0+SCcj5LgpveT/rmK8fMcwoZTQdea+49LBYOvmVf2dN/ez13xN400XwlbibVL2O14+RM/O/0WvCfHX7QF14rW40jw7YZgnHl77iPzHf8A7Z1B4c/Z98ReLr0ah4qvZLYSD95vfzJ3/GvdPCHw40DwRAU0qxSNz9+eT55H+pr5HmzrPf8Apxh3/wCBn0y/snJ3dv29Vf8AgCPnX4Pa7e/DHx6+lazbvaQ6gEjlikP3H/gf/P8Az0r6wVwyZA6ivHfjl8LLvxhJYajpEAfUI38mTJ2fu+9eneGIr620DT4tUmSW/jiCTyR9Hf1FdvD+FxOWyr4Cor04fBP1ODO8Rh8wjTx1P+JP415m2OlLSClr7k+WCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDG8Wf8AIs63/wBeU/8A6LrwT/gn9/ybRo3/AF/3n/pQa998TI7+F9WRPnkNpKB7nYa8L/YN0u70f9nPSbS+tbixuReXeYblPLk/1p7UAfRdFeYXPxcurf462vw+/wCEbvJLKfT/ALb/AG3gfZ0P7z939f3den0Aeb/FjUviZp66d/wrzR9B1YP5n2v+27iSLZx8mzZ+NfKGj678bB+15r1xB4b8KSeM/wDhF4kuLF7yX7H9j+0x/vPM/wCentX3vXmWn/B+Cw+PGqfEz+05ZZ7/AEZNH/s3y/3cYEkcnmB+p/1Y/OgC98Lb74g6jpt5J8QtK0TSbxJcW8eiXEkkbx4/j3968L8CfAX41+CpPE+naL428P8AhrR77V7jVI5Y9ON5cXHm/wDP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KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr5E1fS7j9rD9oDXvD2q3dxF8M/BEkcc+mwSbI9UvOuJPWMV9d18p/s03aeA/j/8Y/Aupf6NqWoap/b1n5n/AC8W8n/POgD3P/hSPw//ALF/sn/hCtC/sz/n2/s+LZ+WKyPg58B9E+CU+uJ4evNR/svU5/tCaXcz77e0PcRA9K9QqtHcRyO8aSIXjxvTP3KALNFFFAHEfGHxDe+FfhZ4r1jSpBDqNhp1xcwSGPzAjpGccVW+BfibUPGfwc8F65rE4n1TUNLt7q4kEflh5HjyePxrw343/staBpnw48Z64nizxhJKlpcXn2WXWZJLfpnHl/3Pas74BfsqaF4n+DngzWJ/FfjC2mvNMt53trHXJY7aPjP7uPtQB2v7axW78G+CNMk/eRah4v06OSL/AJ6J5nP9K9Wj0j4fXN2bSOw8Ny3mP+PeOK3Mn5VD8WPg94b+NWgW+j+JIriS3t7hLuP7NP5ciSDpzXnWvfsQ/CbVNF+x2Hh3+xL6PmDUrK4lFxE//PTO/mgD3XTNLs9Gthb2VrBZwDny7eMRp+lfLv7K1p4Xu9L+J2u+JY9IlkvPHGq+Xc6kkY8yP93/AM9K6n9i/wAda74s+HGtabr98+r33h3WLjSk1GT/AJeY48CM/lWhbfsY/CY6pqOpXXhsavNfzyXDC+u5JEiMn3/L54oA9T0Xw74bR47/AEjTNJjf+C5sreMH/vtK6SvjPWvA8H7LH7Qfw5i8D3V1B4Z8ZXj6fqHhySeSSKM/89Yh2/1n/kOvsygDI1TQNK1ny/7R020vjH9z7VAknl/nXyb4203Sv2ofiFc+APB1jZab4E0ScDxJr9lbxxyXcn/PnbyAce9fXdxL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jfcr8KfFEskvijVpJJPNkkvJP/Rlfuv/AA1+Kf7QXg1/h98aPGGhSR+XHb6hJJH/ANc5P3kf/kOSspmcy7+zL/ycB8Pv+wxb/wDoyv2f/hr8XP2b7qO1+Pnw+kk/6DlnH/5Er9o/4aIBDYdXjH7YH/JtHj3/AK80/wDRsdez14p+2JLHD+zR45En8dnGn/kWOtTQ/Hyvrz/gmhJPH8Y9ejRP9Gk0eTzP+/sdfIdffP8AwTG8ETQxeMPFkqYik8vTrf8A9GSf+065qZzUz71ooorpOkKKozapaW04gkuoY7h+RG8lXqACiiigAooooAKKKQ9KAPOfih8K4viZJYGa9e0W0LkCNA27NdnpVt/Z1jBa+Z5hiRU3Y615d8Y/GfjHwvqdonh+xmubJ4d7yRWvmYff0/KvPU/aB8c2g/03TFA/27SSOvhK+cZdlmOqc9OfO/LQ+soZVj8wwlN06kORbK6PqJIRGSQMU47T1Ab6ivmWP9qnV4mxNo1s/uJHT+YrVtf2qQ/+u0L/AL4uCf8A2nXVT4ryqppz/h/wDOpw1mq19n+K/wAz6HCgdAKKpabc/wBoWFvdbPLM8aSbPTvV6vsFZrQ+Yas7MKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8h+Nf7Puk/F2bTtXttTuvC/i/S/n0/XtNIEsZx0k/56J7GvXqKAPm3/AIQH9pXyP7N/4Wb4U+z/APQX/sY/bP8Av3/q67j4G/Aa3+DsGqXs3iDU/FPiXWH83U9V1J/+PiT1EfRK9aooA8w+BfhTx14O8IXNh8QfEcXinWXvHljvYg+EgKR4j57giT869PoooAz9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W7lHj+hrs/hL8C08D3Tapqlwl5qvRDH9yP6V+XwwubV8NTyVUOSn9uZ+hyxWWYfFVM49pz1PsQ8/Mt6F8FvD2k+EDp97ZxXFzLETNdOPn34/h9K4H9mF2j1zW7ZHeW0RCVz67zXTfH34j3mhwjw7p1tMlxfx/PcAdI++z3rX+A3w+m8G+Hjc36iO/vf3jxZ+4vpXorD0ZZzQoYCFlQ+M4fb14ZTiK+Mnd1/gXz38j1gdKWiiv0o+ECiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBgGM81maloFlrBtze2sdwYJBPH5nOx/WtMGjGaynTVRWqbBCbh8A0fKvQLWL4j8X6T4VsvtOqX0VpEO8h+9XC/Gv4j6x4EsbOLS7JJXu/3Yu3PEb9vk715b4c+EPif4magdS8SXU9pA3V5/vt/uJ2r5HMc6q0q/wBQwFDnqd/sL5n0uByqnUo/W8ZVUKf4v5Gh4u/aE1XxFP8A2b4StZE8z9354j8yd/oK1Phb8F9ft/EMHiPXb+W3uEff5f33l/66GvV/CXw20TwNFt0qzWJv455Pnkf6msn4jfF/Rvh2Uhn8y7v5BuFtF2/3/SvNWWOk1mee4jWHS/uHovMPap5fkuH0n13m/wDI9BAK5wMUvT3NeKeG/wBpvR9SvI4NU02fSjJ0lZ98f6V7HbXUd5Ekkbq8bfcdK+xwOZYTMIc+Eqc58zi8uxeAfJiafIXKKKK9Q88KKKKACiiigAooooAKKKKACiiigAooooAKKKTNAC0UmR60tACYoxS0UAZl7otjqNxbz3VrDcXFuS8Ekkf+rrRC46HijdRuqVBJ3SBzb0Y6iiiqAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKxf8AhKtF+0/Z/wC2bH7T/wA8/tMe/wDLNAG1RRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRVW4v7eyCCeeOAvwvmPjNAFqiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAKlxZwXezz4kl2NvXeucGpwAo4GKWqWped/Zl39kYJceW/ln/AG8HH61g7Uk5WNFeWhZUh854PcV8oa7ZW8/x/nh1+JZbZ70HEnTZ/wAs/wD2nXdfAX4j6v4o1rVLHXL157hIw8cbxJH/AL/A96pftKeEMpZ+KLaP95CPJm/9kf8AA1+e5xVhm2VQx1GF1TnzuHe3f8z7bKqLyzMp4HE6OpCyfqtLHZ/Ez4N6R4r0R/sNnBZajDF+4e3QR7h/d4rlP2bPGF1OuoeGr5/MNr80Jcf99p+Feg/CLxQfGXgewup8PcxgwTH/AG06/rXNeDfg5qPhf4iXPiB762azneZvs8e/I3n8u1dksK54rB5lllO3P8f+A54YjlwmIy7MJ6w+D1PZaKTcFHJA+tIHU9GB/GvvLo+NHUUmaKYC0UmaMj1oAWikzS0AFFFFABRSZozQA3hRQORRx+NZPiHxDZeGNMuNRv5xb2kAzJIegrGpUhThzzLhBzfJDcmv9Qi0u2N1dSR29sg3yySHAFfN3jX9ojU59fhOhN5OmWsnJk6T+z+lVPEniXxD8e/Ei6bo1vJb6PG+M/8ALP8A33r2jw98HfD/AId8IzaTLAt2Z4yLq4k+/L9a/O8Ri8wz1uGWP2dOn9v+c+3w+EweSJVMw/eVJ/Y/k8zX8C+NbHx1okV/ZvhgP3sP8aP6GusAFfGGm+JpPhN4/n/sm8W+09X2SLGRslT/ABFfWvhXxPY+LNFg1GwmEsEg6j+GvYyDO1mUPq+If7+G/meVnGTPATWIpr93PVf5M3qKQUtfZHzQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAV4949/ae8E+BPEcnh7fqfiTxEn+s0nw5p8l7cx/74j6V2fxQ1+78LfDnxTrGnoJr2w0y5uoI/wDbSMkV5J+w/wCGNO0v4C6L4ij/ANI1rxGJNQ1PUpOZbiXzZOZH9qAO4+GP7Q/gn4ranc6VpN9cWuvWw3z6Lq1tJaXkX1ik5/KrPxN+O/hD4RLbReINRk/tG8/49NJs4jcXtz/1zjTk11//AAjGkv4hTXP7Ntv7aSD7OL3yv3oj/ub/AEzXzV+y9bJ47+NPxh8b6yn2jxDZ6z/Ytn5v/LpZx9BH/ntQB6V4L/ao8E+MPEcHh+cat4V164GbfTvFGnSafLcf9cxJ1rqfi78XdC+C/hePXdeS6eyku47ICzi8xxJJ04rgv2yPBWleKPgN4lv76NI9Q0S3/tSwvRxJbXEfIKP29K8V/ak1y+8dfsR+A9S1YSxajqN5pZnlx84k8uTMn580Aex+JP20/hv4Y1G4txJq+q2NnJ5V5q2m6fJcWds/pJIOlev+GvGujeMvDFvr+hXser6TcR+ZFNa/P5g9qi8P+D9G0LwXZeHrHToIdEjtRb/Ywn7vy9mMV88fsEj+zNA+JOiwDy9N0vxXc21nF/zzjoA43wL+1zqX/DQHxDW+0Lx5qXh5be2On6Da6GZLjTz5cfmebHn93X0r4i+N/hjwX8ObLxr4j+26BpV4I9lte2ci3Ikk6RvEP4+teO/BT/k+X47f9eWnf+i469M+OHxt0v4WJomnNo1z4n8UaxPs0jRLVMyTyJzvz/Bj1oA5i2/be+G/9oW0Gp2/iHw3b3L+XBqOr6RLb20h/wCulezeJvFNt4e8LXmtpa3esQW9ubj7NpEX2m4nT/pnH/Gea+cPix4u+KviX4YeIbDxR8FbCXRbjTpxJ9n8QxySQfuz+88vy/8Aln/SvRv2QNTm1L9m7wJNdu8kw09UJk/2Dj+lAHhX7Pv7XOqSTeN/+Ek0Lx34pH9ty/YPsOiG4NnBxi3kwf3cn/TOvrrxX490LwJ4al8QeIdSg0TSok3yTXp8vH1r57/YZ/1/xi/7HG7/AJ034y2yeP8A9sT4W+DNejM3hqx0+41xLaX7lzeDzPL/AO/fl5oA6iP9tbwB5lvJfWfiTSNFuX8uDX9S0SWPTpD/ANda9uttasLzSE1WC6guNPkj8+O5jk3xmPrvBo1vQdO8R6Rc6VqdpBe6dcx+XPbSpmN09K+KfhNrN94a+Anxv8KQTvcaL4Z1+40nT7qXqlu8nlyD+f8A38oA+gtP028+N9vJrWtXt1pvgWQ/6BpUEnkfb4uvn3DjkxyA/wCrrlbPxd+zTfeJo/DEEnhCXVZJPIjEVqCzyen2jZ1/7aVH+2Ne3WmfDvwd4K0qZ9H0/wAUa7Z+Hri8t/3f2e3kyNn4j+Vd548+GXgbw58Dtc0G40axsvDFhpkspiESRiPy4/8AWZ/56cffoA5a3eHwNpNz4n+Husv4l8D2dxJHq+gCf7SLQR/617R/vo8f/PLv7cV6f4y+JOi+Cvh5d+NruSW50S3tku/Ns4/MkljkI8soO/3xXmH7GHhhPC/7MPhUXLYN/BJqVy8vcSOX/wDQMVyXjvf/AMO/da83/V/2ZJ9m/wCvf7Z/o/8A5D8ugDvvEP7XXw68O/8ACM2817dz6lr9vBcW2nWVv5k6Ry/6vzAD8n411XxN+PHg74Ri2t9e1KQ6pd/8e2k2URuL24/65xpya4X9j34U6Z4B+D3h7WjbpdeINcs472/1JyJZZA4zHH5n9xEIGPauX/ZUs4/HXxY+L3jnWUNz4ht9ck0W3ll5+yW0f/LOP+5QB6L4J/an8E+NPEkXh6Yat4X164/1GneJNPkspbj/AK5h+tdt8TviLpXwm8D6n4r1hJn0vT/La4FvH5jjfIkYwP8AgY/CvM/2zfB2meJ/gL4i1K9RI9R0OA6pp16OZLe4j6FP8964346eIr7xZ+wFe6xqMbDUbzSNPluA/wDz0Nxb5/WgDq9d/bO+G/h9YWB1rU4Rbx3F5JpunSXEWn+YN4Fw4/1b+1dB4i/ao+Hfh3w/o2qpq8utjWo9+nWek273FxcD2jHP51ofs/8Ag3SfDXwQ8IaTZWUEdjNpFvJNGYx+9kkiDyb/AMTXi37DXw+0Pw54g+LV/p9jHFcW/iSXSoJMf6u3j/eeXH7fvKAPZ/hL+0d4I+MN/e6ZoV3cW+s2Y33Gk6lB9nuox7oa7Hx3488P/DTw7c694k1KDSdKtx+8uZjgCvnD486fBoH7YPwR1awiW31DUZLmzu5Ihjz4sdH/AO/lYv7SXiie6/aw+H+k3XhfVfGWjaPpcmswaJpsccv2i58ySPzDHJ/zz8ugD1HS/wBsr4f32oWcGowa94atrx9llqWvaRJbWlwf+mch4Neh/FT4o6N8IfAt74v10TyaXa+WHNnF5kmJJBHHgfVxXi/xM+KerfEzwLrHhzUvgZ44ktr+CWLElvb/ACPj92/+s9a81+LNt4msP+Ccq2fi+1urHxBZPbW8sN7/AK3y471I4v8AyH5dAH0JrX7U3w+0fxnoHhb7ddXviHWPs4jsrK382S3EmPL+0f8APP74rpfiZ8bvCPwht7V/EWpNFd3Z/wBE0+3iM9zcf9c405NYX7OPwm0f4b/DTRjbwLLrF/aRXeoajLiS4uJJIwSfM615n+z7bx+OP2m/jN4s11TPrOhahHoemR3A/wCPO2/ef6v/AK6bM0Aeg+E/2svAviTxJb+H74av4S1m7H+iW3ijT5NONz/1z8zrXtNeMftYeCdK8bfAjxgNSRTPpmn3GoWdzj95b3McZkjKflXkfxI+KfiSf/gnzYeJGlmj1nVNMtrS4usfvDHJJ5ckv/bSMf8AkSgD1HV/2u/A2n6veabpMGveLpbBxHeSeHNLkvY7b/ro44rtvhb8Y/CXxi0qa98L6ol79nfy7i3kXZPbyekidQaPg74G0bwB8NfD2i6JaR21klpFKPK/jkdBvf8AGuY+OUkPwy+EfxF8V+GtNt7HXbiwMkl7boEkeTHliR/9wHP4UAQ+MP2rfBPhnX7nQrSPV/Fus2g/0uz8L6fJqJtv+unl9K6X4ZfHLwf8Ybe6/wCEc1Jpby0P+l6dcRGC5t/+ukb8iuZ/ZK8IaT4S+AXhFtNiTfqdnHqN5dY/eXFxJ+8kkc+vNed/tE2EPgD9ov4Q+MdDja21rWNQk0bUEt/+Xy3Pl/6z6UAfRfjv4geH/hp4cude8SalBpOlW/8ArLiY8CvJ/Cn7Z3w48UatZ2DyatoYv5PKsrzWdOktre8f0jkPBri/jZp0fxG/bK+Gfg3WohceG7HSrjWPscg+S4uP3nX6eXHX0b4x8EaN498MXnh/WrGO90q7j8uSGROooA5v4ZfGnw78V/CereINDW6j0/TL2ezuBcxeW4kjjDvx/wADq58Jfizovxn8FW3ifQEuk064kkiT7ZF5UhKH0r53/YJtRYfs4+N7NH81LfXNRjEv/PT/AEeKut/4J9f8m26V/wBf95/6MoA9a8R/FfRvDXxE8MeDbtLo6r4gSWS08qPMeI/v7z2qX4m/Fjwv8JNBTVfFGpx2NtI/lQRA75biT/nnGnVzXkHxn/5PA+B//XvqP/ouvO/G/i+6H7bGt3dz4J1nxtH4V0e2j0yz02OOT7JJJ88lx8/fEmKAPavC/wC1j4H8Sa/Z6LfRa14S1G9GLOPxJpkll9r/AOubng1Z/al+J118MvhFr2oWFnrMuoz2dxHaXuk2f2j7HJ5ZxJIf+Wcf+32ryf49+NNe+M/w01bw3/wpTxtb6hJmXT7yW3ixb3Ef+rk/1legfEObWbr9irXpPEkElrr3/CHy/wBoRyf6xJfs/wC8/rQBh/s0ftJz+NfB/gzRtW8PeNLzV7u28u41+40eT7DJJ3kNx0r1L4o/Hfwh8IRY2+u3lxLql/kWek6dbm4vbj/rnGnWsr9kr/k234f/APYKir5x+FvxI1K1+Pnxd8Uz/DzxL421qPWH0W3utORJI7C3j/5ZfOR5dAH0b8Pf2lPBvxC18+HoG1LQfERj8xNG1+yks7mQY/gEnWsf9p+H4fiPwM/j2DVbjzNcjt9NOmt9y4k4Hmf7HFeOftE+I/GfxY0vQb/w98HPGOk+LvD+pRahp2o3NvH+7/56JmOTv/Suu/bo3/YPhDv/ANZ/wmFnQB7X8TfjP4X+EFnYyeILq4+038nlWenWdubi6uH9I405Nc14I/ak8GeNPFVv4Xkh1rwz4guhm307xBpklnLcf9c81y/7QXw58aj4n+EPil4EsbPX9W8P28tlcaHfSeX5sUneOTs/zmrvw+/ac0Xxj430/wAKeL/CmpeBvG0mTaWmtWo/fevkSd6APoCuI+JvxZ8LfCPRY9S8UatHpsUr+VbxZ3S3En/POOPq5rt6+UfBNpB8Rf23PHd1r8Juf+EP0+2t9Dt7kDZB5n+tkj+tAHbaf+2N4Ek1SysdZtvEXhH7a/l2lz4j0mSzgnPtIeK9d8SeLdH8G6Dc61rWpW+naTbpvkvbiTEYFP8AEfhjSfF+lyadrOnW2q2UnzG3uo/MjP5182/tLxR+Mf2ifgz4C1Uj/hFrx7jULm3I/d3EsQ/dxmgDp/8Ahtn4fqsd3NaeJbbQZH8uPxHLodwNOJ/664/pXt+i67p3iTSINV027g1DTbiPzILm3ffHInqDUt3pdpfafJYT20Mtk6eXJbyJ8hT0xXzL+yIH8L+LvjD4CtHaXw94f1jGn5/1duJPMzH+lAHQ6d+278OdS8LWWsWra1fz3cskcWk22nmW9xH/AKyTy0J+T3roNE/aw+GWueBNQ8Vx+II7fTrCT7PcwXCeXcRS/wAEfln+P2ryr/gm34X06x+C2o67HaoNUv8AV7iOe5/5aeXHs8uM/SoYfhx4duv+Ch9zM+nQnyvDX9sbPL+T7aJI4/M+vlyUAeo+Dv2wPh94w8VW3hp31fw/q15/x6Q69p8lmbn/AK5k9a9yr5f/AOCg+lWknwBm1ryUOo6RqFtc2dx/HFJ5navozw9cG60HTp5sCWW2jdvqVFAGpRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABSEZBHrS0h6UAfNfxQ+Hms+AfFf/AAl/huN57Yv58kSf8sX/APjdc343+N2p/ELw+NBj0lLaad0E/l/vPMz/AM86+sJAdgAfB9+9UbfRLC1ma5Syhjnx/rEQbjXweK4cnKpOGEr8lOp8cP8AI+vw/EFO1P63Q9pUp/BP/M4r4J+D7rwX4Shtr9PKu52M0kX9wntXZeINetPDejXOo3riO3gQu+a0t4YqSOcZzXzh+0F43uPEuu2fhDSsybZMz7P+Wj/8869HG14ZDlqVNax9yBwYShUzvH3qbPWfoYc3iPxx8cNcuIdKeS206LgRB/LRP+ulP1DwZ8Rvhkh1S1vJbm3i/wBZ9kbzM/78de9fDXwLH4F8MwaeioZSN07j+OTua6uWFPs7r2I714dHhurXofWcViJ+2332PXr8RewqPDYWlD2G1rbnnXwj+LEHxEsnini+zalBxNH/AHv9v6V6UTk429O9fLPwi2W3xwvI7D/j0Pn/APfH+fLr2r4vax4h0fw7FN4etnubvzwJNibtidzXo5PmlSeWzr4r3/Z/jY8/NcshTzGFCh7ntLPXpc7xMZ4FEg5+6D+NfNNj+0b4k0dtms6IG9wjwfzzXaaX+014bvl/0qG6tD7pu/lXTh+Jssr/ABVOT/HoRW4dzKntT5/SzPYxgDpxS8EVS03U7fWtPt7y0k8y2nTzEcdxWV4j8caL4TjLajfwW/H3Wb5j+FfQ1K9KnT9tUqWgfPwo1J1PZwhdnQqWz0ApzHngZry60/aD8GXFx5QvJoz/AHpIHA/lXfaRr9l4gtEudOuobu3P/LSJ8iufD5lg8XpQqKZvWwWLw/8AHpuBoY9VpxGQOK8h+Lnjrxb4MIk0vSFksTg/bN3mf+Ofw07wB+0BpHiopaakTpd/2Ev3H+hrjnneBp4n6pUnyT8zsWT4uphfrdNc8PI6v4oeMX8CeFLjVI0WWfckccbnqSawPhi918Rfh/cXXiPyruPUpJPLh8vASP7mK5D9qHWlew0fS4jnz5PO/KvWfAOlf2D4O0ew6GK3XdmvNp4ipjc6qYdfw6cP/SzuqUKeDyqlX/5eVJv7kHhnwnpXgXRvsllGltCil3d+r+7mvEPiV8Xr/wAaX/8AwjXhGNnjnJRriL/WTe6f7HvX0iyoxz3IxXK+Gvh1ofg2/vr6wtViuLliS5x8g/uJ7VvmWW169OGEwk/Z0/t+hzZdjaGHqVMVi6ftKn2PXzPPvCP7Oem2/hq4i1sifUrqPmRP+WH/AFz9K818KeJ9R+CHjq80ueWO905n2TJG/b/nof8Abr0T4ufG5dJL6F4cc3OpyfJJOh+57J6v7VB8JfggIpF17xKDPeP86W0nr/ff1NfF18LQqYuhhcjh79Dep/Xxn19DF16eEqYjOnenU2h1+Xb+n6+7WF7HqFlBcwnMcyB1q1SKMAClr9eV7an5q7X0CiiimIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigCrdWcd9bywXCCWCRNjxn+Kvlrw/8Oviz+zLd6hpvw+0mw+IPw/uLmS5s9Hub37Ne6eX/AOWcckn7vy6+r6KAPEfhfD8ZfEHjaTX/ABy+l+F/DscDxQeFtOP2iR5P+eklx/Sua8bfBzxz8O/ilqPxE+ErWF9/bHOueF9Rl8qO8k/56xyf8s5K+k6KAPlXxL4M+L/7SMFt4f8AGmi6f8NPAnmJJqdrbagLy+1DZ1iEkf7uOPiui/a1+E+r+Nvg1o3hfwXpP22Wx1SzmSyjkjj2W8YcdZPwr6IooAgto/Lt4427Jg14H+yl8N/Efw1f4lN4k04aZ/a/iS41CzHmRuZID0f5K+g6KAPlPxX4D+JXwv8A2h/EfxH8BeGrTxtpPia0t7e/06XUI7a4gkjEceQZOvEda3xa+FvxA8Va18N/idoVpplr4/8ADcbi80G4uD9nuEk/1kSSfTfz719LUUAfNPirVPjd8WPCGs6Ingm0+H8U9ncRXF9c6nHe3Fx8mPLt44/9Xv8A+mlegfsy+ENW+H/wO8K+HtdtPsOrWNt5c9tvR9h3nunFerUUAfIfhjwV8YP2e/HfjiDwh4N07xt4Y8R6rLqtvcSaoltLaSP18zzOv4V6b8ffgfqPxNi8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hgYe0pzfwfb0Z95nFXAY2rTwWM/d1IL4+l2ux7ujZ6BSPY1m+ItKbXNGu7KO5kszPGY/Pi++leY/B618f2Ti38QJH/ZkY2iW6k/fn8q9ibk9q/U8NiHjsP7SpScL9Jn5ziaH1GvyQqKduqPIPhd8CoPB1ydT1R0v9W3fK/8ABH9K9hXAHAwKYqleSafning8DQy+l7HDwJxWNr46p7au7skooor0zjCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACivlT9uX9orxj+z9aeDZfCrWAOqyXkdx9tg8wfuxF5ePxkrz/4I/tk+PvjR8Y/CmkadpBTweI449TvItPeTzJPs/7x3k6R/vOKAPuuivhj4pft5+INX8eXHgz4OeG/+EhvreSSM30kTz+aY+pjjH/LP/ppWDpP7dfxR+Evim20z4w+CjaWdx/y1t4PIkjj/wCekf8AyzkFAH6C0V8xfteftJat8Lfg/wCFPGngS7sLqLWNQijjuLmPzIpLd7eWTP8A5Dr561r9vX4vX3gXSdY8PeE1i023t/L1TXJdMlkt5Lj/AKZn/VpHQB+kVFfntZ/8FDPHvjnwfZ2HgvwDLf8AjNInk1CSCCS5t44x/wAtI0j5P412H7In7bPiH4s/ECTwL45sLS21a4ike0uLZPLzJH/rI5I6APtmivm/9q79riz/AGe7ez0nTbA634v1BDJb2XSOCP8A56SV4Ld/tj/Hj4R3NhrPxE8AwReGdQkwg8k2+B6CTs/tJQB+hVFfNP7Qn7SN34W/Zt034leAZbeRb64tjF9sh34jk378D+/x+lfOfhb9vX4nfEGTwfoWhaRH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KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD4G/4Ks/8AIL+G/wD111H+VtX0h8IPAsOhfsu6Novh2GO2uLzw55kciD79xPb+YZP+/khqL9o79l/SP2k4NBj1bWL/AEhNHeeSI2SoTIZPLznP/XMV6j4S8OR+EfCmiaJFM9xFpdnDZxyv9+QRp5eT+VAH5zf8E9PiD4b+FXxL8X6L4vng0TWtQjjt7e4vf3flyRySeZbf5/5516L/AMFHfin4I134daT4bs9SsdW8Tf2glxGLNxIbePYTIOP744r2r42fsS/D7426rJrN3HcaJr04/wBIvdNOz7R/10TvXP8Awv8A+Ce/w3+H+tJqt+9/4ou4H8yKPUvL8qM/9c0FAHzf+0Doeq+Hf2BfhDYazFJHef2p5uyT/WRxyR3Mkf8A5Devpb4c2EA/4J+LH9nj8s+ELxzFs/j8qX+teiftE/s86T+0T4U03QdV1K70i2sbz7ZHLZqmc+VJHjn2krT0L4O2Gh/BFfhtHfTyaf8A2XPpX21tnmeXJG6GT64egD5T/wCCVkMZ0r4iz7E837RZp5g7/wDHxXB+AIktv+CmtwkcaRx/23qH3P8Ar2uK+xP2cv2ZNJ/Zstdet9J1m/1eLV5I5JDeqg8vy/M9P+ulZOj/ALH+h6N+0K/xaj1u+k1d7ue7NjsQRZkikjPP/bSgD48/bstdW0H9rbTdS+1ppEdxb2cmn6lfR+Zb2/l/8tf+2cldf8WvAfxU8V+AXt/G3x68CX3hO9kjlJkuB8//ADz8vy7evtX4ufBDwf8AHDQF0nxVpouo4/8AUXER8u4gP/TOTtXz14e/4Jm/DvTdWju7/Wda1a1j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";

// ═══════════════════════════════════════════════════════
// ─── LOGIN / AUTENTICAÇÃO ───────────────────────────────
// ═══════════════════════════════════════════════════════

var SENHAS = { '2002': 'admin', '0035': 'financeiro', '0040': 'operacional' };
var ACESSO = {
  admin:       ['estoque','contratos','produtos','regras','producao','separacao','agenda','financeiro','analise'],
  financeiro:  ['contratos','produtos','producao','separacao','agenda','financeiro','analise'],
  operacional: ['contratos','producao','separacao','agenda']
};

let perfilAtual = null;

function tentarLogin() {
  const s = document.getElementById('login-senha').value.trim();
  const p = SENHAS[s];
  if (!p) { 
    document.getElementById('login-erro').textContent = 'Senha incorreta'; 
    return; 
  }
  perfilAtual = p;
  sessionStorage.setItem('perfil', p);
  document.getElementById('login-overlay').style.display = 'none';
  aplicarPerfil(p);
  go('fechamento');
}

function aplicarPerfil(p) {
  const ac = ACESSO[p] || [];
  // Mostrar/ocultar itens do menu
  document.querySelectorAll('[data-modulo]').forEach(el => {
    const m = el.getAttribute('data-modulo');
    el.style.display = (m === 'estoque' ? ac.includes('estoque') : ac.includes(m)) ? '' : 'none';
  });
  // KPI de faturamento: só admin
  const kpiBox = document.getElementById('kpi-box');
  if (kpiBox) {
    kpiBox.style.display = p === 'admin' ? '' : 'none';
    if (p === 'admin') setTimeout(rKpiFaturamento, 300);
  }
  // Label do perfil
  const labels = { admin: 'Administrador', financeiro: 'Financeiro', operacional: 'Operacional' };
  const el = document.getElementById('perfil-label');
  if (el) el.textContent = labels[p] || p;
}

function fazerLogout() {
  sessionStorage.removeItem('perfil');
  perfilAtual = null;
  window._contratosInited = false;
  document.getElementById('login-senha').value = '';
  document.getElementById('login-erro').textContent = '';
  document.getElementById('login-overlay').style.display = 'flex';
}

// ═══════════════════════════════════════════════════════
// ─── CONTRATOS ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════

let dadosContrato = {};

function setContratoView(v) {
  if (v === 'importar') { setTimeout(initImportacao, 50); }
  ['importar','lista'].forEach(k => {
    const el = document.getElementById('cview-'+k);
    if (el) el.style.display = v === k ? '' : 'none';
    const btn = document.getElementById('cv-'+k);
    if (btn) btn.classList.toggle('active', v === k);
  });
  if (v === 'lista') rContratos();
}

// ─── IMPORTAÇÃO DE CONTRATOS EXISTENTES VIA PDF ───────────────────────────────

function initImportacao() {
  const zone = document.getElementById('imp-upload-zone');
  if (!zone || zone._initDone) return;
  zone._initDone = true;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor='#4F8EF7'; });
  zone.addEventListener('dragleave', () => zone.style.borderColor='#2A2F42');
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.style.borderColor='#2A2F42';
    if (e.dataTransfer.files[0]) processarPDFImportacao(e.dataTransfer.files[0]);
  });
}

function lerPDFImportacao(input) {
  if (input.files[0]) processarPDFImportacao(input.files[0]);
}

async function processarPDFImportacao(file) {
  try {
    // Limpar dados anteriores antes de processar novo PDF
    window._dadosImportacao = {};
    // Limpar formulário
    ['imp-nome','imp-tipo','imp-data','imp-conv','imp-local','imp-ini','imp-fim','imp-equipe','imp-valor'].forEach(id => {
      const el = document.getElementById(id); if(el) el.value = '';
    });
    document.getElementById('imp-form').style.display = 'none';
    document.getElementById('imp-status').textContent = 'Lendo PDF…';
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    let txt = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const tc = await pg.getTextContent();
      // Preservar quebras de linha reais baseadas na posição Y dos itens
      let lastY = null;
      let pageLines = [];
      let currentLine = '';
      for (const item of tc.items) {
        const y = item.transform ? Math.round(item.transform[5]) : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
          if (currentLine.trim()) pageLines.push(currentLine.trim());
          currentLine = item.str;
        } else {
          currentLine += (currentLine && item.str && !currentLine.endsWith(' ') ? ' ' : '') + item.str;
        }
        lastY = y;
      }
      if (currentLine.trim()) pageLines.push(currentLine.trim());
      txt += pageLines.join('\n') + '\n';
    }
    window._ultimoTxtPDF = txt;
    preencherFormImportacao(txt, file.name);
    document.getElementById('imp-status').textContent = 'PDF lido ✓ — confirme os dados ao lado.';
    document.getElementById('imp-form').style.display = '';
  } catch(e) {
    document.getElementById('imp-status').textContent = 'Erro ao ler PDF: ' + e.message;
  }
}

function extrairDadosContratoRomero(txt) {
  // Normaliza espaços entre dígitos (PDF às vezes separa "8 0 0 . 5 0 5" etc)
  let t = txt.replace(/(\d)\s+(\d)/g,'$1$2').replace(/(\d)\s+(\d)/g,'$1$2');

  // Normaliza letras isoladas separadas por espaço: "R a q u e l" → "Raquel"
  // Preserva espaços entre palavras completas: "festa com" continua "festa com"
  // Aplica 2x para pegar todas as ocorrências
  const normLetras = (s) => s
    .replace(/\b([A-ZÀ-Úa-zà-ú]) (?=[A-ZÀ-Úa-zà-ú] |[A-ZÀ-Úa-zà-ú]\b)/g,'$1')
    .replace(/\b([A-ZÀ-Úa-zà-ú]) (?=[A-ZÀ-Úa-zà-ú] |[A-ZÀ-Úa-zà-ú]\b)/g,'$1');
  t = normLetras(t);
  // Normaliza espaços múltiplos → simples
  t = t.replace(/  +/g,' ');
  const d = {};

  // ── CLIENTE ────────────────────────────────────────────────────────────────
  // PDF pode quebrar a linha entre o nome e "portadora/doravante", então
  // testamos cada linha e também o par linha[i] + linha[i+1] concatenados.
  // PDF pode vir com ou sem quebras de linha.
  // Estratégia 1: busca no texto corrido — "SERVIÇOS  Nome, portadora"
  const mNomeCorrido = txt.match(/SERVI[CÇ]OS\s+([A-ZÀ-Úa-zà-ú][^,\n]{3,80}?)\s*,\s*(?:portadora|portador)/i);
  if (mNomeCorrido) {
    d.contratante = mNomeCorrido[1].trim();
  } else {
    // Estratégia 2: busca linha a linha (ou par de linhas)
    const linhas = txt.split('\n').map(l=>l.trim()).filter(Boolean);
    for (let i = 0; i < linhas.length; i++) {
      const candidatos = [linhas[i], i+1 < linhas.length ? linhas[i]+' '+linhas[i+1] : ''];
      let achou = false;
      for (const linha of candidatos) {
        if (/portadora|portador|doravante/i.test(linha) && linha.length > 10) {
          const separador = linha.match(/,\s*(?:portadora|portador|CNPJ|CPF|residente|doravante)/i);
          const nome = separador
            ? linha.slice(0, separador.index).trim()
            : linha.replace(/\s*(portadora|portador|doravante).*/i,'').trim();
          if (nome && !/CONTRATO|PRESTAÇÃO/i.test(nome) && nome.length > 3) {
            d.contratante = nome; achou = true; break;
          }
        }
      }
      if (achou) break;
    }
  }

  // ── CPF ────────────────────────────────────────────────────────────────────
  const mCPF = t.match(/CPF\s*n[oº°]?\s*([\d]{3}[\.,][\d]{3}[\.,][\d]{3}[-][\d]{2})/i);
  if (mCPF) d.cpf = mCPF[1];

  // ── TIPO DE EVENTO ─────────────────────────────────────────────────────────
  // Captura: "no Casamento", "no noivado", "em um Festa Junina", "na festa de casamento"
  const mTipo = t.match(/\bno\s+(Casamento|Noivado|Aniversário|Aniversario|Formatura|15\s*Anos|Debutante)\b/i)
             || t.match(/\bna\s+(?:festa\s+de\s+)?(Casamento|Noivado|Aniversário|Formatura)\b/i)
             || t.match(/\bem\s+um\s+([\w\s]{3,30}?),\s*que\s+será/i)
             || t.match(/\b(Casamento|Noivado|Aniversário|Aniversario|Formatura|15\s*Anos|Festa\s+\w+)\b/i);
  d.tipo = mTipo ? mTipo[1].trim() : 'Evento';

  // ── NOME DO EVENTO ─────────────────────────────────────────────────────────
  const mEvento = t.match(/(Casamento entre [^\n,\.]{3,60}|festa de casamento de [^\n,\.]{3,60}|noivado (?:da?|de) [^\n,\.]{3,60}|Aniversário de [^\n,\.]{3,60}|Formatura de [^\n,\.]{3,60}|15 [Aa]nos de [^\n,\.]{3,60})/i);
  if (mEvento) d.nomeEvento = mEvento[1].trim();

  // ── DATA ───────────────────────────────────────────────────────────────────
  const meses = {janeiro:'01',fevereiro:'02','março':'03',abril:'04',maio:'05',junho:'06',
    julho:'07',agosto:'08',setembro:'09',outubro:'10',novembro:'11',dezembro:'12'};
  const mD = t.match(/no dia\s+(\d{1,2})[\/\-](\d{2})[\/\-](\d{4})/i);
  if (mD) {
    d.data = `${mD[3]}-${mD[2]}-${mD[1].padStart(2,'0')}`;
  } else {
    const mDE = t.match(/(?:no dia|realizada?\s+no\s+dia)\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i);
    if (mDE) {
      const mes = meses[mDE[2].toLowerCase()] || '00';
      d.data = `${mDE[3]}-${mes}-${mDE[1].padStart(2,'0')}`;
    } else {
      // "realizado no dia 01/05/2026" sem "no dia" explícito
      const mD2 = t.match(/realizado[^\n]*?(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i);
      if (mD2) d.data = `${mD2[3]}-${mD2[2]}-${mD2[1].padStart(2,'0')}`;
    }
  }

  // ── CONVIDADOS ─────────────────────────────────────────────────────────────
  const mConv = t.match(/atender\s+(\d+)\s*convidados/i)
             || t.match(/qual\s+seja\s+(\d+)\s*(?:\(|pessoas)/i);
  if (mConv) d.convidados = mConv[1];

  // ── LOCAL ──────────────────────────────────────────────────────────────────
  // Padrão 1: "no endereço localizado no/na X" → até \n ou Início ou Cerimonia
  const mL1 = txt.match(/endereço localizado (?:no|na)\s+(.+?)(?=\n|Início|Cerimoni|CLÁUSULA)/i);
  if (mL1) {
    d.local = mL1[1].trim().replace(/\s+/g,' ').replace(/\.\s*$/,'');
  } else {
    // Padrão 2: "no Espaço/Fazenda X, localizado Y"
    const mL2 = txt.match(/no\s+((?:Espaço|Fazenda|Chácara|Clube|Hotel|Sítio)\s+[^\n]+?),\s*localizado\s+(.+?)(?=\n|Cerimoni|CLÁUSULA)/i);
    if (mL2) {
      d.local = `${mL2[1].trim()}, ${mL2[2].trim().replace(/\.\s*$/,'')}`;
    } else {
      // Padrão 3: "realizado no dia X, Condomínio/Rua/Av/Espaço..." — pega após a data
      const mL3 = txt.match(/realizado[^\n]*?\d{2}[\/\-]\d{2}[\/\-]\d{4},?\s+(.+?)(?=\n|Início|Cerimoni|CLÁUSULA)/i);
      if (mL3) d.local = mL3[1].trim().replace(/\.\s*$/,'');
    }
  }

  // ── HORÁRIOS — SEMPRE da Cláusula 2b ──────────────────────────────────────
  // Formato real: "sendo o início às \n19h00min do dia 09/05/2026 e término às 03h00min"
  // Usa [\s\S] para tolerar quebra de linha entre "às" e o horário
  const txtH = txt.replace(/\r/g,'');
  const mH = txtH.match(/sendo o in[\u00ed\u0069]cio [\u00e0a]s[\s\S]{0,30}?(\d{1,2})h(\d{2})[\s\S]{0,80}?t[\u00e9e]rmino [\u00e0a]s\s*(\d{1,2})h(\d{2})/i)
           || txtH.match(/sendo o in[íi]cio [àa]s[\s\S]{0,30}?(\d{1,2}):(\d{2})[\s\S]{0,80}?t[ée]rmino [àa]s\s*(\d{1,2}):(\d{2})/i);
  if (mH) {
    d.hrInicio = `${mH[1].padStart(2,'0')}:${mH[2]}`;
    d.hrFim    = `${mH[3].padStart(2,'0')}:${mH[4]}`;
  }

  // ── DURAÇÃO ────────────────────────────────────────────────────────────────
  const mDur = t.match(/dura[cç][aã]o de\s+0*(\d+)h?\s*(?:horas?\s*)?(?:de\s*festa)?/i);
  if (mDur) d.duracao = parseInt(mDur[1]) + 'h';
  else if (d.hrInicio && d.hrFim) {
    const [hi,mi] = d.hrInicio.split(':').map(Number);
    let [hf,mf]   = d.hrFim.split(':').map(Number);
    if (hf < hi) hf += 24;
    const mins = (hf*60+mf)-(hi*60+mi);
    d.duracao = Math.floor(mins/60)+'h'+(mins%60?(mins%60)+'min':'');
  }

  // ── HORA EXTRA ─────────────────────────────────────────────────────────────
  const mHE = t.match(/horas?\s+extras?,?\s+no valor de\s+R\$\s*([\d\.]+,\d{2})/i);
  if (mHE) d.horaExtra = mHE[1];

  // ── EQUIPE — bloco após "equipe de trabalho que será composta por:" ─────────
  d.equipe = [];
  // Extrai o bloco até "m)" (Bebidas) ou "l)" ou "CLÁUSULA"
  // Extrai apenas cargos conhecidos — ordem fixa: Head Bartender, Bartender, Bar Back, Copeiro...
  // Funciona tanto com linhas separadas quanto com tudo numa linha só
  const CARGOS_DEF = [
    { re: /Head\s*Bartenders?|Coordenadores?/i,  nome: 'Head Bartender' },
    { re: /Bartenders?/i,          nome: 'Bartender' },
    { re: /Bar\s*Back/i,          nome: 'Bar Back' },
    { re: /Copeiros?/i,            nome: 'Copeiro' },
    { re: /Garç[oõ]ns?/i,         nome: 'Garçom' },
    { re: /Auxiliares?/i,          nome: 'Auxiliar' },
    { re: /Recepcionistas?/i,      nome: 'Recepcionista' },
  ];
  const ORDEM_CARGOS = CARGOS_DEF.map(c => c.nome);
  const mBloco = txt.match(/equipe de trabalho que ser[aá] composta por:([\s\S]{0,600})/i);
  if (mBloco) {
    const blocoTexto = mBloco[1];
    for (const c of CARGOS_DEF) {
      // Busca "número (extenso)? cargo" em qualquer ponto do bloco
      const mC = blocoTexto.match(new RegExp('(\\d+)\\s*(?:\\([^)]+\\))?\\s*' + c.re.source, 'i'));
      if (mC) {
        // Garante que não confunde "Bartender" com "Head Bartender"
        if (c.nome === 'Bartender' && /Head/i.test(mC[0])) continue;
        d.equipe.push({ qtd: parseInt(mC[1]), cargo: c.nome });
      }
    }
    // Ordenar pela ordem padrão
    d.equipe.sort((a, b) => ORDEM_CARGOS.indexOf(a.cargo) - ORDEM_CARGOS.indexOf(b.cargo));
  }
  const ordemCargo = ['Head Bartender','Bartender','Bar Back','Copeiro','Garçom','Auxiliar'];
  d.equipe.sort((a,b)=>{
    const ia = ordemCargo.findIndex(c=>a.cargo.toLowerCase().startsWith(c.toLowerCase()));
    const ib = ordemCargo.findIndex(c=>b.cargo.toLowerCase().startsWith(c.toLowerCase()));
    return (ia<0?99:ia)-(ib<0?99:ib);
  });
  d.equipeTotal = d.equipe.reduce((s,e)=>s+e.qtd,0);
  d.equipeTexto = d.equipe.map(e=>`${e.qtd} ${e.cargo}`).join(' · ');

  // ── VALOR TOTAL — "Valor total do serviço – R$ X" ou "Valor total do serviço – R$X" ──
  const mVT = t.match(/[Vv]alor total do servi[cç]o\s*[–\-]\s*R\$\s*([\d\.]+,\d{2})/i);
  if (mVT) d.valorTotal = mVT[1];

  // ── PARCELAS — padrão fixo com "R$ X" (com ou sem espaço após R$) ─────────
  d.parcelas = [];
  // Sinal: "R$ X.XXX,00 (extenso) no ato da assinatura deste contrato"
  const mSinal = t.match(/R\$\s*([\d\.]+,\d{2})\s*\([^)]+\)\s*no ato da assinatura deste contrato/i);
  if (mSinal) {
    d.parcelas.push({
      valor: mSinal[1],
      descricao: 'Sinal — assinatura do contrato',
      vencimento: new Date().toISOString().slice(0,10)
    });
  }
  // Restante: "R$ X.XXX,00 (extenso) para o dia DD/MM/AAAA"
  const mRest = t.match(/R\$\s*([\d\.]+,\d{2})\s*\([^)]+\)\s*para o dia\s+(\d{2})[\/\-](\d{2})[\/\-](\d{4})/i);
  if (mRest) {
    d.parcelas.push({
      valor: mRest[1],
      descricao: `Restante — venc. ${mRest[2]}/${mRest[3]}/${mRest[4]}`,
      vencimento: `${mRest[4]}-${mRest[3]}-${mRest[2]}`
    });
  }

  // ── CARDÁPIO ─────────────────────────────────────────────────────────────
  // Pega tudo da letra e) até f) — cláusula 2.1 do contrato Romero
  {
    let cardapioRaw = '';
    const tCard = t.replace(/\r/g, '');
    // Tentativa 1: e)...f) com quebras de linha reais
    let mc = tCard.match(/\ne\)[^\n]*fornecimento[^\n]*\n([\s\S]*?)\nf\)\s*Responsabilizar/i);
    if (mc) { cardapioRaw = mc[1]; }
    // Tentativa 2: Coquetéis até f)
    if (!cardapioRaw) {
      mc = tCard.match(/Coquet[eé]is?:?([\s\S]*?)(?=\nf\)\s*Responsabilizar|\nf\)\s*Provid|CLÁUSULA\s*[23])/i);
      if (mc) { cardapioRaw = mc[0]; }
    }
    // Tentativa 3: e) até f) em linha única
    if (!cardapioRaw) {
      mc = tCard.match(/e\)[\s\S]*?Coquet[eé]is?:?([\s\S]*?)(?=f\)\s*Responsabilizar)/i);
      if (mc) { cardapioRaw = mc[1]; }
    }
    if (cardapioRaw) {
      const sep = cardapioRaw.includes('\n') ? '\n' : ' - ';
      const linhas = cardapioRaw.includes('\n')
        ? cardapioRaw.split('\n')
        : cardapioRaw.split(/(?= - [A-ZÁÉÍÓÚ])/);
      d.cardapio = linhas
        .map(function(l){ return l.trim(); })
        .filter(function(l){ return l.length > 1; })
        .filter(function(l){ return !/^f[).]|^g[).]|^CLÁUSULA|^Responsabilizar/i.test(l); })
        .join('\n')
        .trim();
    }
  }
  // ── BEBIDAS CLIENTE — cláusula 1, letra l) (opcional) ───────────────────
  // Formato: l) ...destilados...sendo:\nBEBIDA ESTIMATIVA\nVODKA 04 A 06 GARRAFAS\nGIN...
  {
    const mL = t.match(/l\)[^\n]*destilados?[^\n]*\n([\s\S]*?)(?=\nm\)|\nCLÁUSULA|\n[a-z]\))/i);
    if (mL) {
      const linhas = mL[1].split('\n')
        .map(function(l){return l.trim();})
        .filter(function(l){return l && !/^(BEBIDA|ESTIMATIVA|VALOR)(\s+(BEBIDA|ESTIMATIVA|VALOR))*$/i.test(l);})
        .map(function(l){
          return l.replace(/\s+\d+\s+A\s+\d+\s+GARRAFAS?.*$/i,'')
            .replace(/\s+\d+\s+GARRAFAS?.*$/i,'')
            .replace(/\s+R\$[\d.,]+\s*$/,'').trim();
        })
        .filter(function(l){return l.length > 1;});
      if (linhas.length) d.bebidasCliente = linhas.join('\n').trim();
    }
  }

  // ── BEBIDAS ROMERO ou CONSIGNADAS — letra m) ─────────────────────────────
  {
    var _idxM = txt.search(/m\s*\)\s*Bebidas fornecidas pela ROMERO/i);
    if (_idxM >= 0) {
      var _blocoM = txt.substring(_idxM);
      var _isC = /CONSIGNADA/i.test(_blocoM.split('\n')[0]);
      var _linhasM = _blocoM.split('\n').slice(1);
      var _bebs = [];
      for (var _li = 0; _li < _linhasM.length; _li++) {
        var _l = _linhasM[_li].trim();
        if (!_l) continue;
        if (/^(BEBIDA|ESTIMATIVA|VALOR)/i.test(_l)) continue;
        if (/^ESTIMATIVA DE BEBIDAS/i.test(_l)) continue;
        // Se começa com letra minúscula seguida de ) é nova alínea
        if (/^[a-z]\s*\)/.test(_l)) break;
        if (/^CLÁUSULA/i.test(_l)) break;
        _l = _l.replace(/\s+\d+\s+[Aa]\s+\d+\s+[Gg][Aa][Rr][Rr][Aa][Ff][Aa][Ss]?.*/,'')
               .replace(/\s+\d+\s+[Gg][Aa][Rr][Rr][Aa][Ff][Aa][Ss]?.*/,'')
               .replace(/\s+R\$[\d.,]+\s*$/,'').trim();
        if (_l.length > 2) _bebs.push(_l);
      }
      if (_bebs.length) {
        if (_isC) { d.bebidasConsignadas = _bebs.join('\n'); }
        else      { d.bebidasRomero = _bebs.join('\n'); }
      }
    }
  }

  // ── TRANSPORTE (regra 60km de BH) ─────────────────────────────────────────
  const cidadesForaBH = [
    'ponte nova','sete lagoas','pedro leopoldo','lagoa santa','vespasiano',
    'itabirito','ouro preto','mariana','congonhas','conselheiro lafaiete',
    'juiz de fora','uberlândia','uberaba','montes claros','governador valadares',
    'ipatinga','divinópolis','pará de minas','formiga','lavras','alfenas',
    'poços de caldas','três pontas','varginha','passos','patos de minas',
    'teófilo otoni','muriaé','viçosa','barbacena','são joão del rei',
    'coronel fabriciano','timóteo','caratinga','manhuaçu'
  ];
  const normExt = s => s.toLowerCase()
    .replace(/pte\.?\s*/g,'ponte ')
    .replace(/[áàã]/g,'a').replace(/[éê]/g,'e').replace(/[íi]/g,'i')
    .replace(/[óôõ]/g,'o').replace(/[úü]/g,'u').replace(/ç/g,'c');
  const localNorm = normExt(d.local||'');
  d.transporte = cidadesForaBH.some(c => localNorm.includes(normExt(c)))
    ? 'Por conta da Romero' : 'Por conta do colaborador';

  return d;
}

function preencherFormImportacao(txt, nomeArquivo) {
  const d = extrairDadosContratoRomero(txt);
  window._dadosImportacao = d;

  const set = (id,v) => { const el=document.getElementById(id); if(el && v!==undefined && v!=='') el.value=v; };
  console.log('[DEBUG] contratante:', JSON.stringify(d.contratante));
  console.log('[DEBUG] primeiras linhas:', JSON.stringify(txt.split('\n').slice(0,6)));
  set('imp-nome',   d.contratante);
  set('imp-tipo',   d.tipo);
  set('imp-data',   d.data);
  set('imp-conv',   d.convidados);
  set('imp-local',  d.local);
  set('imp-ini',    d.hrInicio);
  set('imp-fim',    d.hrFim);
  set('imp-equipe', d.equipeTexto);
  set('imp-valor',  d.valorTotal);

  // Mostrar resumo
  const resumo = document.getElementById('imp-resumo');
  if (resumo) {
    resumo.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:6px;font-size:12px">
      ${d.nomeEvento?`<span class="tag tag-blue">🎉 ${d.nomeEvento}</span>`:''}
      ${d.equipeTexto?`<span class="tag tag-blue">👥 ${d.equipeTexto}</span>`:''}
      ${d.duracao?`<span class="tag tag-blue">⏱ ${d.duracao}</span>`:''}
      <span class="tag tag-yellow">🚗 ${d.transporte||''}</span>
      ${d.parcelas&&d.parcelas.length?`<span class="tag tag-green">💰 ${d.parcelas.length} parcela(s)</span>`:''}
    </div>`;
    resumo.style.display='';
  }
}

function salvarImportacao() {
  const nome  = document.getElementById('imp-nome')?.value?.trim();
  const data  = document.getElementById('imp-data')?.value;
  if (!nome || !data) { alert('Preencha pelo menos Nome e Data.'); return; }

  const d = window._dadosImportacao || {};
  const valorText = document.getElementById('imp-valor')?.value?.trim() || '';
  const valorNum  = parseFloat(valorText.replace(/\./g,'').replace(',','.')) || 0;

  // Parcelas: usar as do contrato se existirem, senão calcular 20/80
  let parcelas = d.parcelas || [];
  if (!parcelas.length && valorNum > 0) {
    const p1 = (valorNum*0.2).toLocaleString('pt-BR',{minimumFractionDigits:2});
    const p2 = (valorNum*0.8).toLocaleString('pt-BR',{minimumFractionDigits:2});
    parcelas = [
      { valor: p1, descricao: 'Sinal — assinatura do contrato', vencimento: new Date().toISOString().slice(0,10) },
      { valor: p2, descricao: 'Restante', vencimento: '' }
    ];
  }

  const contrato = {
    nome, cpf: d.cpf||'',
    tipo:       document.getElementById('imp-tipo')?.value||'',
    nomeEvento: d.nomeEvento||nome,
    data,
    local:      document.getElementById('imp-local')?.value?.trim()||'',
    convidados: document.getElementById('imp-conv')?.value?.trim()||'',
    hrInicio:   document.getElementById('imp-ini')?.value||'',
    hrFim:      document.getElementById('imp-fim')?.value||'',
    duracao:    d.duracao||'',
    equipe:     d.equipe||[],
    equipeTexto:document.getElementById('imp-equipe')?.value?.trim()||'',
    equipeTotal:d.equipeTotal||0,
    opcao: valorText, valorNum,
    parc1: parcelas[0]?.valor||'', parc2: parcelas[1]?.valor||'',
    parcelas,
    horaExtra:  d.horaExtra||'',
    convExtra:  d.convExtra||'',
    cardapio:   d.cardapio||'',
    bebidasRomero: d.bebidasRomero||'',
    bebidasCliente: d.bebidasCliente||'',
    bebidasConsignadas: d.bebidasConsignadas||'',
    transporte: d.transporte||'',
    status:     document.getElementById('imp-contrato-status')?.value||'concluido',
    origem: 'importado'
  };

  salvarContratoCompleto(contrato);
  limparImportacao();
  alert('Contrato importado! Agenda, financeiro e produção atualizados.');
  setContratoView('lista');
}

function limparImportacao() {
  ['imp-nome','imp-tipo','imp-data','imp-conv','imp-local','imp-ini','imp-fim','imp-equipe','imp-valor','imp-contrato-status'].forEach(id => {
    const el=document.getElementById(id); if(el) el.value='';
  });
  document.getElementById('imp-form').style.display = 'none';
  document.getElementById('imp-status').textContent = '';
  document.getElementById('imp-pdf-input').value = '';
}


function initContratos() {
  setContratoView('lista');
  const zone = document.getElementById('contrato-upload-zone');
  if (!zone || zone._initDone) return;
  zone._initDone = true;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor='#4F8EF7'; });
  zone.addEventListener('dragleave', () => zone.style.borderColor='#2A2F42');
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.style.borderColor='#2A2F42';
    if (e.dataTransfer.files[0]) processarPDF(e.dataTransfer.files[0]);
  });
}

function lerPDFContrato(input) { if (input.files[0]) processarPDF(input.files[0]); }

async function processarPDF(file) {
  try {
    document.getElementById('contrato-status').textContent = 'Lendo PDF…';
    const ab = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
    let txt = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const tc = await pg.getTextContent();
      txt += tc.items.map(it => it.str).join(' ') + '\n';
    }
    extrairDadosContrato(txt);
    document.getElementById('contrato-status').textContent = 'PDF lido com sucesso ✓';
    document.getElementById('contrato-form').style.display = '';
  } catch (e) {
    document.getElementById('contrato-status').textContent = 'Erro ao ler PDF: ' + e.message;
  }
}

function extrairDadosContrato(txt) {
  // Usa a função completa de extração Romero para PDFs
  dadosContrato = extrairDadosContratoRomero(txt);

  const set = (id, v) => { const el = document.getElementById(id); if (el && v) el.value = v; };
  set('c-tipo', dadosContrato.tipo);
  set('c-data', dadosContrato.data);
  set('c-convidados', dadosContrato.convidados);
  set('c-local', dadosContrato.local);
  set('c-opcao', dadosContrato.valorTotal);
  const isCas = dadosContrato.tipo === 'Casamento';
  const elCer = document.getElementById('c-cerimonia-row');
  if (elCer) elCer.style.display = isCas ? '' : 'none';
}

async function gerarContratoDocx() {
  const nome     = document.getElementById('c-nome')?.value?.trim();
  const cpf      = document.getElementById('c-cpf')?.value?.trim();
  const endereco = document.getElementById('c-endereco')?.value?.trim() || '';
  const tipo     = document.getElementById('c-tipo')?.value?.trim() || dadosContrato.tipo || '';
  const data     = document.getElementById('c-data')?.value?.trim() || '';
  const conv     = document.getElementById('c-convidados')?.value?.trim() || '';
  const local    = document.getElementById('c-local')?.value?.trim() || '';
  const hrIni    = document.getElementById('c-hora-inicio')?.value?.trim() || '';
  const opcao    = document.getElementById('c-opcao')?.value?.trim() || '';
  const cer      = document.getElementById('c-cerimonia')?.value?.trim() || '';

  if (!nome || !cpf) { alert('Preencha Nome e CPF.'); return; }

  const btn = document.getElementById('btn-gerar-contrato');
  if (btn) { btn.disabled = true; btn.textContent = 'Gerando…'; }

  try {
    const dtObj = data ? new Date(data + 'T12:00:00') : null;
    const dtFormatada = dtObj ? dtObj.toLocaleDateString('pt-BR', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : '';
    const dtSimples   = dtObj ? dtObj.toLocaleDateString('pt-BR') : '';

    let hrFim = '';
    if (hrIni && dadosContrato.duracao) {
      const [h, m] = hrIni.split(':').map(Number);
      const fim = new Date(0); fim.setHours(h + parseInt(dadosContrato.duracao), m);
      hrFim = `${String(fim.getHours()).padStart(2,'0')}:${String(fim.getMinutes()).padStart(2,'0')}`;
    }

    const valorNum = parseFloat((opcao||'0').replace(/[^\d,]/g,'').replace(',','.')) || 0;
    const parc1 = (valorNum * 0.2).toLocaleString('pt-BR', {minimumFractionDigits:2});
    const parc2 = (valorNum * 0.8).toLocaleString('pt-BR', {minimumFractionDigits:2});

    if (!window.PizZip || !window.Docxtemplater) { alert('Libs de geração não carregadas ainda. Aguarde e tente novamente.'); return; }
    if (!window.TEMPLATE_B64_GLOBAL) { alert('Template do contrato não carregado. Verifique a conexão.'); return; }

    const templateBytes = Uint8Array.from(atob(window.TEMPLATE_B64_GLOBAL), c => c.charCodeAt(0));
    const zip = new PizZip(templateBytes);
    const docx = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    docx.setData({
      CONTRATANTE: nome,
      CPF: cpf,
      ENDERECO: endereco,
      TIPO_EVENTO: tipo,
      DATA_EVENTO: dtFormatada || dtSimples,
      DIA_FESTA: dtSimples,
      CONVIDADOS: conv,
      LOCAL_EVENTO: local,
      HORARIO_INICIO: hrIni,
      HORARIO_FIM: hrFim,
      DURACAO: (dadosContrato.duracao||'') + 'h',
      VALOR_TOTAL: opcao ? 'R$ ' + opcao : '',
      VALOR_SINAL: 'R$ ' + parc1,
      VALOR_RESTANTE: 'R$ ' + parc2,
      EQUIPE: dadosContrato.equipeTexto || '',
      COQUETEIS: dadosContrato.coqueteis || '',
      DESTILADOS: dadosContrato.destilados || '',
      MODULOS: dadosContrato.modulos || '',
      VALOR_HORA_EXTRA: dadosContrato.horaExtra || '',
      VALOR_CONVIDADO_EXTRA: dadosContrato.convExtra || '',
    });
    docx.render();
    const blob = new Blob([docx.getZip().generate({type:'arraybuffer'})], {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Contrato_${nome.split(' ')[0]}_${dtSimples?.replace(/\//g,'-')||''}.docx`;
    a.click(); URL.revokeObjectURL(a.href);

    // Salvar na lista e alimentar agenda + financeiro
    // Criar estrutura de parcelas corretamente
    const parcelas = [
      { valor: parc1, descricao: 'Sinal — assinatura do contrato', vencimento: new Date().toISOString().slice(0,10) },
      { valor: parc2, descricao: 'Restante', vencimento: '' }
    ];

    salvarContrato({
      nome, cpf, tipo, data, local, convidados:conv,
      hrInicio:hrIni, hrFim,
      equipe:dadosContrato.equipe||[],
      equipeTexto:dadosContrato.equipeTexto||'',
      equipeTotal:dadosContrato.equipeTotal||0,
      opcao, valorNum,
      parcelas,
      status:'ativo', origem:'sistema'
    });
    rContratos();
    alert('Contrato gerado! Evento adicionado à agenda e parcelas ao financeiro.');
  } catch(e) {
    console.error(e); alert('Erro ao gerar: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📄 Gerar Contrato (.docx)'; }
  }
}

function salvarContrato(c) {
  const equipeArray = Array.isArray(c.equipe) ? c.equipe : [];
  const parcelas = c.parcelas || [];

  salvarContratoCompleto({...c,
    equipe: equipeArray,
    equipeTexto: c.equipeTexto || (equipeArray.map(e=>`${e.qtd} ${e.cargo}`).join(' · ')) || '',
    equipeTotal: c.equipeTotal || equipeArray.reduce((s,e)=>s+(e.qtd||0),0) || 0,
    parcelas: parcelas,
    nomeEvento: c.nome,
    duracao: c.duracao || '',
    transporte: c.transporte || '',
    hrInicio: c.hrInicio || c.hrIni || '',
    hrFim:    c.hrFim    || ''
  });
}

function salvarContratoCompleto(c) {
  if (!D.contratos) D.contratos = [];
  const id = 'CON'+Date.now();
  D.contratos.push({ id, ...c, criadoEm: new Date().toISOString() });
  sv('contratos');

  // → AGENDA com equipe detalhada
  registrarEventoNaAgenda({
    contratoId: c.id||'',
    nome: c.nomeEvento||c.nome, data: c.data, tipo: c.tipo,
    local: c.local, conv: c.convidados,
    hrIni: c.hrInicio, hrFim: c.hrFim, duracao: c.duracao,
    equipe: c.equipe||[], equipeTexto: c.equipeTexto||'', equipeTotal: c.equipeTotal||0
  });

  // → FINANCEIRO com parcelas reais do contrato
  registrarParcelasContratoFinanceiro(c);

  // → PRODUÇÃO com ficha pré-preenchida
  registrarFichaProducao(c);
}

function registrarParcelasContratoFinanceiro(c) {
  if (!D.financeiro) D.financeiro = [];
  const parcelas = c.parcelas||[];
  if (parcelas.length) {
    parcelas.forEach((p,i) => {
      const valNum = parseFloat((p.valor||'0').replace(/\./g,'').replace(',','.')) || 0;
      D.financeiro.push({
        id: 'FIN'+Date.now()+'_'+i,
        contratoId: c.id||'',
        contrato: c.nome, evento: c.nomeEvento||c.nome,
        data: c.data, tipo: c.tipo, convidados: c.convidados,
        descricao: p.descricao,
        valor: 'R$ '+p.valor, valorNum: valNum,
        vencimento: p.vencimento||'',
        status: 'pendente'
      });
    });
  } else if (c.valorNum > 0) {
    const p1 = (c.valorNum*0.2).toLocaleString('pt-BR',{minimumFractionDigits:2});
    const p2 = (c.valorNum*0.8).toLocaleString('pt-BR',{minimumFractionDigits:2});
    D.financeiro.push({ id:'FIN'+Date.now()+'A', contratoId:c.id||'', contrato:c.nome, evento:c.nomeEvento||c.nome,
      data:c.data, tipo:c.tipo, convidados:c.convidados,
      descricao:'Sinal — assinatura do contrato', valor:'R$ '+p1, valorNum:c.valorNum*0.2,
      vencimento:new Date().toISOString().slice(0,10), status:'pendente' });
    D.financeiro.push({ id:'FIN'+Date.now()+'B', contratoId:c.id||'', contrato:c.nome, evento:c.nomeEvento||c.nome,
      data:c.data, tipo:c.tipo, convidados:c.convidados,
      descricao:'Restante', valor:'R$ '+p2, valorNum:c.valorNum*0.8,
      vencimento:'', status:'pendente' });
  }
  sv('financeiro');
}

function registrarFichaProducao(c) {
  if (!D.producoes) D.producoes = [];
  D.producoes.push({
    id:           'PRD'+Date.now(),
    contratoId:   c.id||'',
    proposta:     c.proposta||'',
    evento:       c.nomeEvento||c.nome,
    cliente:      c.nome,
    tipo:         c.tipo||'',
    data:         c.data,
    convidados:   c.convidados,
    local:        c.local,
    transporte:   c.transporte||'',
    hrInicio:     c.hrInicio||'',
    hrFim:        c.hrFim||'',
    duracao:      c.duracao||'',
    equipe:       c.equipe||[],
    equipeTexto:  c.equipeTexto||'',
    horaExtra:    c.horaExtra||'',
    cardapio:     c.cardapio||'',
    bebidasRomero:  c.bebidasRomero||'',
    bebidasCliente: c.bebidasCliente||'',
    obs:          c.obs||'',
    // Campos manuais (editáveis depois)
    pecas:'', cerimonial:'', decorador:'', buffet:'', layout:'',
    pontoEnergia:'', hrChegadaEquipe:'',
    criadoEm: new Date().toISOString()
  });
  sv('producoes');
}


function rAnalise() {
  const subView = document.getElementById('analise-sub-view')?.value || 'dashboard';
  document.getElementById('an-view-dashboard') && (document.getElementById('an-view-dashboard').style.display = subView === 'dashboard' ? '' : 'none');
  document.getElementById('an-view-config')    && (document.getElementById('an-view-config').style.display    = subView === 'config'    ? '' : 'none');
  if (subView === 'config') { rAnaliseConfig(); return; }

  const mes = document.getElementById('an-mes')?.value || '';
  const ano = document.getElementById('an-ano')?.value || '2026';
  const anoPrev = String(parseInt(ano) - 1);

  const fR = v => 'R$\u00a0' + (v||0).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
  const fN = v => (v||0).toLocaleString('pt-BR');

  // Contratos do período
  const todos = D.contratos || [];
  const filtrar = (a, m) => todos.filter(c => {
    if (!c.data) return false;
    if (!c.data.startsWith(a)) return false;
    if (m && !c.data.startsWith(`${a}-${m}`)) return false;
    return true;
  });

  const contratos = filtrar(ano, mes);
  const MESES = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const MESES_NOME = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const somarContratos = (lista) => {
    const fat = lista.reduce((s,c) => {
      const v = parseFloat((c.opcao||'0').toString().replace(/[^\d,]/g,'').replace(',','.')) || 0;
      return s + v;
    }, 0);
    const pax = lista.reduce((s,c) => s + (parseInt(c.convidados)||0), 0);
    return { fat, pax, ticket: pax > 0 ? fat/pax : 0 };
  };

  const atual = somarContratos(contratos);
  const meta  = mes
    ? { fat: parseFloat((D.metas||{})[`${ano}-${mes}`]?.fat||0), pax: parseInt((D.metas||{})[`${ano}-${mes}`]?.pax||0) }
    : Object.values((D.metas||{})).filter((_,i) => MESES.map(m=>`${ano}-${m}`).includes(Object.keys(D.metas||{})[i]))
        .reduce((s,m) => ({ fat: s.fat + (parseFloat(m.fat)||0), pax: s.pax + (parseInt(m.pax)||0) }), {fat:0, pax:0});

  const histKey = mes ? `${anoPrev}-${mes}` : null;
  const hist = mes
    ? { fat: parseFloat((D.historico||{})[`${anoPrev}-${mes}`]?.fat||0), pax: parseInt((D.historico||{})[`${anoPrev}-${mes}`]?.pax||0) }
    : MESES.reduce((s,m) => {
        const h = (D.historico||{})[`${anoPrev}-${m}`] || {};
        return { fat: s.fat + (parseFloat(h.fat)||0), pax: s.pax + (parseInt(h.pax)||0) };
      }, {fat:0, pax:0});

  const pctMeta = meta.fat > 0 ? (atual.fat / meta.fat * 100) : null;
  const difFat  = atual.fat - hist.fat;
  const difPax  = atual.pax - hist.pax;

  // ── Cards principais ──────────────────────────────────────────────────────
  const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.innerHTML = v; };

  // Card meta — semáforo
  const corMeta = pctMeta === null ? '#8B91A8' : pctMeta >= 100 ? '#4FC78E' : pctMeta >= 80 ? '#F7C84F' : '#F74F6B';
  const iconMeta = pctMeta === null ? '—' : pctMeta >= 100 ? '🟢' : pctMeta >= 80 ? '🟡' : '🔴';
  setEl('an-faturamento', fR(atual.fat));
  setEl('an-recebido', '');
  setEl('an-a-receber', '');
  setEl('an-eventos', contratos.length);
  setEl('an-convidados', fN(atual.pax));
  setEl('an-ticket', atual.pax > 0 ? 'R$\u00a0' + (atual.fat/atual.pax).toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—');
  setEl('an-equipe', contratos.reduce((s,c)=>s+(c.equipeTotal||0),0) || '—');

  // Viagens — 60km+ de BH
  const CIDADES_VIAGEM = [
    'ponte nova','sete lagoas','pedro leopoldo','lagoa santa','vespasiano',
    'itabirito','ouro preto','mariana','congonhas','conselheiro lafaiete',
    'juiz de fora','uberlândia','uberaba','montes claros','governador valadares',
    'ipatinga','divinópolis','pará de minas','formiga','lavras','alfenas',
    'poços de caldas','três pontas','varginha','passos','patos de minas',
    'teófilo otoni','muriaé','viçosa','barbacena','são joão del rei',
    'coronel fabriciano','timóteo','caratinga','manhuaçu'
  ];
  const normAn = s => s.toLowerCase()
    .replace(/pte\.?\s*/g,'ponte ')
    .replace(/[áàã]/g,'a').replace(/[éê]/g,'e').replace(/[íi]/g,'i')
    .replace(/[óôõ]/g,'o').replace(/[úü]/g,'u').replace(/ç/g,'c');
  const viagems = contratos.filter(c => {
    const loc = normAn(c.local||'');
    return CIDADES_VIAGEM.some(ci => loc.includes(normAn(ci)))
        || /por conta da romero/i.test(c.transporte||'');
  });
  setEl('an-viagem', viagems.length);

  // ── Barra de meta ─────────────────────────────────────────────────────────
  const metaBox = document.getElementById('an-meta-box');
  if (metaBox && meta.fat > 0) {
    const pct = Math.min(pctMeta, 100).toFixed(1);
    const faltam = meta.fat - atual.fat;
    metaBox.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span style="font-weight:600;color:#E8EAF0">${iconMeta} Meta ${mes ? MESES_NOME[parseInt(mes)-1] : ano}</span>
        <span style="color:${corMeta};font-weight:700;font-size:18px">${pctMeta.toFixed(1)}%</span>
      </div>
      <div style="background:#0D1117;border-radius:6px;height:10px;overflow:hidden;margin-bottom:8px">
        <div style="height:100%;width:${pct}%;background:${corMeta};border-radius:6px;transition:width .6s ease"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:12px;color:#8B91A8">
        <span>Realizado: <b style="color:#E8EAF0">${fR(atual.fat)}</b></span>
        <span>Meta: <b style="color:#E8EAF0">${fR(meta.fat)}</b></span>
        ${faltam > 0 ? `<span style="color:#F74F6B">Faltam: <b>${fR(faltam)}</b></span>` : `<span style="color:#4FC78E">✓ Meta batida!</span>`}
      </div>`;
    metaBox.style.display = '';
  } else if (metaBox) {
    metaBox.innerHTML = '<span style="color:#8B91A8;font-size:13px">Configure as metas na aba ⚙️ Configurar.</span>';
    metaBox.style.display = '';
  }

  // ── Comparativo ano anterior ──────────────────────────────────────────────
  const compBox = document.getElementById('an-comp-box');
  if (compBox) {
    const linhas = MESES.map((m, i) => {
      const cx = filtrar(ano, m);
      const s  = somarContratos(cx);
      const h  = (D.historico||{})[`${anoPrev}-${m}`] || {};
      const hFat = parseFloat(h.fat||0);
      const hPax = parseInt(h.pax||0);
      const mt  = (D.metas||{})[`${ano}-${m}`] || {};
      const mFat = parseFloat(mt.fat||0);
      const pct  = mFat > 0 ? s.fat/mFat*100 : null;
      const cor  = pct === null ? '#2A2F42' : pct >= 100 ? '#0D2E1A' : pct >= 80 ? '#2E2A0D' : '#2E0D0D';
      const corT = pct === null ? '#8B91A8' : pct >= 100 ? '#4FC78E' : pct >= 80 ? '#F7C84F' : '#F74F6B';
      const difF = s.fat - hFat;
      const difP = s.pax - hPax;
      const seta = v => v > 0 ? `<span style="color:#4FC78E">▲</span>` : v < 0 ? `<span style="color:#F74F6B">▼</span>` : '';
      return `<tr style="border-bottom:1px solid #1E2333;background:${cor}">
        <td style="padding:8px 12px;font-weight:600;color:#E8EAF0">${MESES_NOME[i]}</td>
        <td style="padding:8px 12px;color:#8B91A8;text-align:right">${hPax > 0 ? fN(hPax) : '—'}</td>
        <td style="padding:8px 12px;color:#8B91A8;text-align:right">${hFat > 0 ? fR(hFat) : '—'}</td>
        <td style="padding:8px 12px;color:#8B91A8;text-align:right">${hPax > 0 ? 'R$\u00a0'+(hFat/hPax).toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—'}</td>
        <td style="padding:8px 12px;color:#E8EAF0;text-align:right;font-weight:500">${s.pax > 0 ? fN(s.pax) : '—'}</td>
        <td style="padding:8px 12px;color:#E8EAF0;text-align:right;font-weight:500">${s.fat > 0 ? fR(s.fat) : '—'}</td>
        <td style="padding:8px 12px;color:#E8EAF0;text-align:right;font-weight:500">${s.pax > 0 ? 'R$\u00a0'+(s.fat/s.pax).toLocaleString('pt-BR',{minimumFractionDigits:2}) : '—'}</td>
        <td style="padding:8px 12px;text-align:right">${seta(difP)}<span style="color:${difP>=0?'#4FC78E':'#F74F6B'}">${difP !== 0 ? (difP>0?'+':'')+fN(difP) : '—'}</span></td>
        <td style="padding:8px 12px;text-align:right">${seta(difF)}<span style="color:${difF>=0?'#4FC78E':'#F74F6B'}">${difF !== 0 ? (difF>0?'+':'')+fR(difF) : '—'}</span></td>
        <td style="padding:8px 12px;text-align:right;font-weight:700;color:${corT}">${pct !== null ? pct.toFixed(0)+'%' : '—'}</td>
      </tr>`;
    });
    // Totais
    const totAtual = somarContratos(filtrar(ano, ''));
    const totHist  = MESES.reduce((s,m) => { const h=(D.historico||{})[`${anoPrev}-${m}`]||{}; return {fat:s.fat+(parseFloat(h.fat)||0), pax:s.pax+(parseInt(h.pax)||0)}; }, {fat:0,pax:0});
    const totMeta  = MESES.reduce((s,m) => { const mt=(D.metas||{})[`${ano}-${m}`]||{}; return {fat:s.fat+(parseFloat(mt.fat)||0), pax:s.pax+(parseInt(mt.pax)||0)}; }, {fat:0,pax:0});
    const totPct   = totMeta.fat > 0 ? (totAtual.fat/totMeta.fat*100).toFixed(0)+'%' : '—';
    compBox.innerHTML = `
      <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="color:#8B91A8;border-bottom:2px solid #2A2F42;font-size:11px">
          <th style="padding:8px 12px;text-align:left">MÊS</th>
          <th style="padding:8px 12px;text-align:right">PAX ${anoPrev}</th>
          <th style="padding:8px 12px;text-align:right">FAT ${anoPrev}</th>
          <th style="padding:8px 12px;text-align:right">TICKET ${anoPrev}</th>
          <th style="padding:8px 12px;text-align:right">PAX ${ano}</th>
          <th style="padding:8px 12px;text-align:right">FAT ${ano}</th>
          <th style="padding:8px 12px;text-align:right">TICKET ${ano}</th>
          <th style="padding:8px 12px;text-align:right">Δ PAX</th>
          <th style="padding:8px 12px;text-align:right">Δ FAT</th>
          <th style="padding:8px 12px;text-align:right">% META</th>
        </tr></thead>
        <tbody>${linhas.join('')}</tbody>
        <tfoot><tr style="border-top:2px solid #2A2F42;font-weight:700;background:#1A1F2E">
          <td style="padding:8px 12px;color:#E8EAF0">TOTAL</td>
          <td style="padding:8px 12px;text-align:right;color:#8B91A8">${fN(totHist.pax)}</td>
          <td style="padding:8px 12px;text-align:right;color:#8B91A8">${fR(totHist.fat)}</td>
          <td style="padding:8px 12px;text-align:right;color:#8B91A8">${totHist.pax>0?'R$\u00a0'+(totHist.fat/totHist.pax).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td>
          <td style="padding:8px 12px;text-align:right;color:#E8EAF0">${fN(totAtual.pax)}</td>
          <td style="padding:8px 12px;text-align:right;color:#E8EAF0">${fR(totAtual.fat)}</td>
          <td style="padding:8px 12px;text-align:right;color:#E8EAF0">${totAtual.pax>0?'R$\u00a0'+(totAtual.fat/totAtual.pax).toLocaleString('pt-BR',{minimumFractionDigits:2}):'—'}</td>
          <td style="padding:8px 12px;text-align:right;color:${totAtual.pax>=totHist.pax?'#4FC78E':'#F74F6B'}">${totAtual.pax-totHist.pax >= 0 ? '+' : ''}${fN(totAtual.pax-totHist.pax)}</td>
          <td style="padding:8px 12px;text-align:right;color:${totAtual.fat>=totHist.fat?'#4FC78E':'#F74F6B'}">${totAtual.fat-totHist.fat >= 0 ? '+' : ''}${fR(totAtual.fat-totHist.fat)}</td>
          <td style="padding:8px 12px;text-align:right;color:${parseInt(totPct)>=100?'#4FC78E':parseInt(totPct)>=80?'#F7C84F':'#F74F6B'}">${totPct}</td>
        </tr></tfoot>
      </table></div>`;
  }

  // ── Semáforo mensal ───────────────────────────────────────────────────────
  const semaBox = document.getElementById('an-semaforo');
  if (semaBox) {
    semaBox.innerHTML = MESES.map((m, i) => {
      const cx = filtrar(ano, m);
      const s  = somarContratos(cx);
      const mt = (D.metas||{})[`${ano}-${m}`] || {};
      const mFat = parseFloat(mt.fat||0);
      const pct  = mFat > 0 ? s.fat/mFat*100 : null;
      const cor  = pct === null ? '#2A2F42' : pct >= 100 ? '#4FC78E' : pct >= 80 ? '#F7C84F' : '#F74F6B';
      const bg   = pct === null ? '#1A1F2E' : pct >= 100 ? '#0D2E1A' : pct >= 80 ? '#2E2A0D' : '#2E0D0D';
      const revisar = pct !== null && pct >= 100
        ? `<div onclick="event.stopPropagation();revisarMeta('${ano}-${m}','${MESES_NOME[i]}')"
            style="font-size:9px;background:#4FC78E;color:#000;border-radius:4px;padding:2px 6px;margin-top:4px;cursor:pointer;font-weight:700">
            ↑ Revisar meta
           </div>` : '';
      return `<div onclick="document.getElementById('an-mes').value='${m}';rAnalise()"
        style="cursor:pointer;background:${bg};border:1px solid ${cor};border-radius:8px;padding:10px 14px;min-width:80px;text-align:center;transition:.2s"
        onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
        <div style="font-size:11px;color:#8B91A8;margin-bottom:4px">${MESES_NOME[i]}</div>
        <div style="font-size:16px;font-weight:700;color:${cor}">${pct !== null ? pct.toFixed(0)+'%' : cx.length > 0 ? cx.length+'ev' : '—'}</div>
        <div style="font-size:10px;color:#8B91A8;margin-top:2px">${cx.length} evento${cx.length !== 1 ? 's' : ''}</div>
        ${revisar}
      </div>`;
    }).join('');
  }
}

function rAnaliseConfig() {
  const ano = document.getElementById('an-ano')?.value || '2026';
  const anoPrev = String(parseInt(ano) - 1);
  const MESES_NOME = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const MESES = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  // Exibir meta anual configurada
  const metaAnualEl = document.getElementById('an-meta-anual-input');
  if (metaAnualEl && !metaAnualEl._loaded) {
    metaAnualEl.value = (D.metas||{}).metaAnual || '';
    metaAnualEl._loaded = true;
  }

  const configBody = document.getElementById('an-config-body');
  if (!configBody) return;

  // Total histórico do ano anterior para calcular proporção
  const totalHist = MESES.reduce((s,m) => s + (parseFloat((D.historico||{})[`${anoPrev}-${m}`]?.fat)||0), 0);

  configBody.innerHTML = MESES.map((m, i) => {
    const hKey = `${anoPrev}-${m}`;
    const mKey = `${ano}-${m}`;
    const h  = (D.historico||{})[hKey] || {};
    const mt = (D.metas||{})[mKey] || {};
    const metaAnual = parseFloat((D.metas||{}).metaAnual) || 0;
    const hFat = parseFloat(h.fat||0);
    // Meta sugerida = proporcional ao histórico
    const metaSugerida = (totalHist > 0 && metaAnual > 0) ? (hFat/totalHist*metaAnual).toFixed(2) : '';
    const metaAtual = mt.fat || metaSugerida;
    return `<tr style="border-bottom:1px solid #1E2333">
      <td style="padding:8px 12px;color:#E8EAF0;font-weight:500">${MESES_NOME[i]}</td>
      <td style="padding:6px 8px"><input class="inp" type="number" style="width:90px" placeholder="PAX" value="${h.pax||''}"
        onchange="salvarHistorico('${hKey}','pax',this.value)"></td>
      <td style="padding:6px 8px"><input class="inp" type="number" style="width:120px" placeholder="R$" value="${hFat||''}"
        onchange="salvarHistorico('${hKey}','fat',this.value);rAnaliseConfig()"></td>
      <td style="padding:6px 8px"><input class="inp" type="number" style="width:90px" placeholder="PAX meta" value="${mt.pax||''}"
        onchange="salvarMeta('${mKey}','pax',this.value)"></td>
      <td style="padding:6px 8px">
        <div style="display:flex;align-items:center;gap:6px">
          <input class="inp" type="number" style="width:120px" placeholder="R$ meta"
            value="${metaAtual}"
            onchange="salvarMeta('${mKey}','fat',this.value)">
          ${metaSugerida && !mt.fat ? `<button class="btn-sm" style="font-size:10px;padding:3px 7px;white-space:nowrap" onclick="salvarMeta('${mKey}','fat',${metaSugerida});rAnaliseConfig()" title="Usar sugestão">✓ usar</button>` : ''}
        </div>
        ${metaSugerida ? `<div style="font-size:10px;color:#8B91A8;margin-top:2px">Sugerido: R$ ${parseFloat(metaSugerida).toLocaleString('pt-BR',{minimumFractionDigits:2})}</div>` : ''}
      </td>
    </tr>`;
  }).join('');
}

function distribuirMetaAnual() {
  const metaAnual = parseFloat(document.getElementById('an-meta-anual-input')?.value||0);
  if (!metaAnual || metaAnual <= 0) { alert('Digite a meta anual primeiro.'); return; }
  const ano = document.getElementById('an-ano')?.value || '2026';
  const anoPrev = String(parseInt(ano) - 1);
  const MESES = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const totalHist = MESES.reduce((s,m) => s + (parseFloat((D.historico||{})[`${anoPrev}-${m}`]?.fat)||0), 0);
  if (totalHist === 0) { alert('Insira o histórico de ' + anoPrev + ' antes de distribuir.'); return; }

  if (!D.metas) D.metas = {};
  D.metas.metaAnual = metaAnual;
  MESES.forEach(m => {
    const hFat = parseFloat((D.historico||{})[`${anoPrev}-${m}`]?.fat||0);
    const mKey = `${ano}-${m}`;
    if (!D.metas[mKey]) D.metas[mKey] = {};
    D.metas[mKey].fat = parseFloat((hFat/totalHist*metaAnual).toFixed(2));
  });
  sv('metas');
  rAnaliseConfig();
  alert('✅ Metas distribuídas proporcionalmente ao histórico de ' + anoPrev + '!');
}

function salvarHistorico(chave, campo, valor) {
  if (!D.historico) D.historico = {};
  if (!D.historico[chave]) D.historico[chave] = {};
  D.historico[chave][campo] = parseFloat(valor) || 0;
  sv('historico');
}

function salvarMeta(chave, campo, valor) {
  if (!D.metas) D.metas = {};
  if (!D.metas[chave]) D.metas[chave] = {};
  D.metas[chave][campo] = parseFloat(valor) || 0;
  sv('metas');
}

function importarCSVAnalise(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const linhas = e.target.result.split('\n').map(l => l.trim()).filter(Boolean);
    const MESES_MAP = {
      'jan':'01','fev':'02','mar':'03','abr':'04','mai':'05','jun':'06',
      'jul':'07','ago':'08','set':'09','out':'10','nov':'11','dez':'12',
      'janeiro':'01','fevereiro':'02','março':'03','abril':'04','maio':'05','junho':'06',
      'julho':'07','agosto':'08','setembro':'09','outubro':'10','novembro':'11','dezembro':'12'
    };

    let importados = 0;
    linhas.forEach(linha => {
      // Detecta separador: ; ou ,
      const sep = linha.includes(';') ? ';' : ',';
      const cols = linha.split(sep).map(c => c.trim().replace(/["']/g,''));
      if (cols.length < 3) return;

      // Formato esperado: MES | ANO | PAX | FATURAMENTO  ou  MES/ANO | PAX | FAT
      let mesNome = cols[0].toLowerCase();
      let ano, pax, fat;

      if (cols.length >= 4) {
        // MES ; ANO ; PAX ; FAT
        ano = cols[1];
        pax = parseFloat(cols[2].replace(/[^\d,]/g,'').replace(',','.')) || 0;
        fat = parseFloat(cols[3].replace(/[^\d,]/g,'').replace(',','.')) || 0;
      } else {
        // MES/ANO ; PAX ; FAT
        const partes = mesNome.split(/[\/\-]/);
        mesNome = partes[0];
        ano = partes[1] || cols[1];
        pax = parseFloat(cols[1].replace(/[^\d,]/g,'').replace(',','.')) || 0;
        fat = parseFloat(cols[2].replace(/[^\d,]/g,'').replace(',','.')) || 0;
      }

      const mesNum = MESES_MAP[mesNome] || MESES_MAP[mesNome.substring(0,3)];
      if (!mesNum || !ano || (!pax && !fat)) return;

      const anoAtual = document.getElementById('an-ano')?.value || '2026';
      const chave = `${ano}-${mesNum}`;

      if (ano === String(parseInt(anoAtual) - 1)) {
        if (!D.historico) D.historico = {};
        if (!D.historico[chave]) D.historico[chave] = {};
        if (pax) D.historico[chave].pax = pax;
        if (fat) D.historico[chave].fat = fat;
      } else if (ano === anoAtual) {
        if (!D.metas) D.metas = {};
        if (!D.metas[chave]) D.metas[chave] = {};
        if (pax) D.metas[chave].pax = pax;
        if (fat) D.metas[chave].fat = fat;
      }
      importados++;
    });

    if (importados > 0) {
      sv('historico'); sv('metas');
      alert(`✅ ${importados} linhas importadas! Atualize a tela.`);
      rAnaliseConfig();
    } else {
      alert('Nenhuma linha reconhecida. Verifique o formato: MES;ANO;PAX;FATURAMENTO');
    }
  };
  reader.readAsText(file, 'UTF-8');
}


function rContratos() {
  const dataIni = document.getElementById('ct-data-ini')?.value || '';
  const dataFim = document.getElementById('ct-data-fim')?.value || '';
  const todos = D.contratos || [];
  const lista = todos.filter(c => {
    if (!c.data) return true;
    if (dataIni && c.data < dataIni) return false;
    if (dataFim && c.data > dataFim) return false;
    return true;
  });
  const tbody = document.getElementById('contratos-body');
  if (!tbody) return;
  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#8B91A8;padding:24px">Nenhum contrato encontrado</td></tr>';
    return;
  }
  const statCor = { ativo:'tag-blue', concluido:'tag-green', cancelado:'tag-red' };
  tbody.innerHTML = '';
  [...lista].sort((a,b) => (b.data||'').localeCompare(a.data||'')).forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${c.nome||'—'}</strong></td>
      <td>${c.tipo||'—'}</td>
      <td>${fd(c.data)}</td>
      <td style="text-align:center">${c.convidados||'—'}</td>
      <td style="font-size:12px">${c.local||'—'}</td>
      <td style="font-size:12px;color:#A8ADB8">${c.equipeTexto||'—'}</td>
      <td>${c.opcao ? 'R$ '+c.opcao : '—'}</td>
      <td><span class="tag ${statCor[c.status]||'tag-yellow'}">${c.status||'ativo'}</span></td>
      <td style="white-space:nowrap">
        <button class="btn-sm" onclick="abrirEdicaoContrato('${c.id}')" title="Editar contrato">✏️</button>
        <button class="btn-sm btn-red" onclick="excluirContrato('${c.id}')">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function excluirContrato(id) {
  if (!confirm('Excluir este contrato e todos os registros vinculados (agenda, financeiro, produção)?')) return;
  const c = (D.contratos||[]).find(x => x.id === id);
  const nomeC = c ? (c.nome||'').toLowerCase().trim() : '';
  const dataC = c ? c.data : '';
  D.contratos  = (D.contratos ||[]).filter(x => x.id !== id);
  // Remover por contratoId (registros novos) OU por nome+data (registros antigos sem contratoId)
  D.agenda     = (D.agenda    ||[]).filter(a => {
    if ((a.contratoId||'') === id) return false;
    if (!a.contratoId && nomeC && (a.nome||'').toLowerCase().includes(nomeC.split(' ')[0]) && a.data === dataC) return false;
    return true;
  });
  D.financeiro = (D.financeiro||[]).filter(f => {
    if ((f.contratoId||'') === id) return false;
    if (!f.contratoId && nomeC && (f.contrato||'').toLowerCase().includes(nomeC.split(' ')[0]) && f.data === dataC) return false;
    return true;
  });
  D.producoes  = (D.producoes ||[]).filter(p => {
    if ((p.contratoId||'') === id) return false;
    if (!p.contratoId && nomeC && (p.cliente||p.evento||'').toLowerCase().includes(nomeC.split(' ')[0]) && p.data === dataC) return false;
    return true;
  });
  sv('contratos'); sv('agenda'); sv('financeiro'); sv('producoes');
  rContratos();
}

function abrirEdicaoContrato(id) {
  const c = (D.contratos||[]).find(x => x.id === id);
  if (!c) return;
  document.getElementById('ec-id').value         = id;
  document.getElementById('ec-nome').value        = c.nome || '';
  document.getElementById('ec-cpf').value         = c.cpf || '';
  document.getElementById('ec-tipo').value        = c.tipo || '';
  document.getElementById('ec-data').value        = c.data || '';
  document.getElementById('ec-convidados').value  = c.convidados || '';
  document.getElementById('ec-ini').value         = c.hrInicio || '';
  document.getElementById('ec-fim').value         = c.hrFim || '';
  document.getElementById('ec-opcao').value       = c.opcao || '';
  document.getElementById('ec-status').value      = c.status || 'ativo';
  document.getElementById('ec-local').value       = c.local || '';
  document.getElementById('ec-equipe').value      = c.equipeTexto || '';
  document.getElementById('ec-bebidas').value     = c.bebidasRomero || '';
  const ecCard = document.getElementById('ec-cardapio'); if(ecCard) ecCard.value = c.cardapio || '';
  document.getElementById('m-edit-contrato').style.display = 'flex';
}

function salvarEdicaoContrato() {
  const id   = document.getElementById('ec-id').value;
  const nome = document.getElementById('ec-nome').value.trim();
  const data = document.getElementById('ec-data').value;
  if (!nome || !data) { alert('Preencha Cliente e Data.'); return; }

  const idx = (D.contratos||[]).findIndex(x => x.id === id);
  if (idx === -1) return;

  const equipeTexto = document.getElementById('ec-equipe').value.trim();
  const equipeArray = equipeTexto.split('·').map(e => {
    const m = e.trim().match(/^(\d+)\s+(.+)$/);
    return m ? { qtd: parseInt(m[1]), cargo: m[2].trim() } : null;
  }).filter(Boolean);

  D.contratos[idx] = {
    ...D.contratos[idx],
    nome,
    cpf:          document.getElementById('ec-cpf').value.trim(),
    tipo:         document.getElementById('ec-tipo').value.trim(),
    data,
    convidados:   document.getElementById('ec-convidados').value.trim(),
    hrInicio:     document.getElementById('ec-ini').value,
    hrFim:        document.getElementById('ec-fim').value,
    opcao:        document.getElementById('ec-opcao').value.trim(),
    status:       document.getElementById('ec-status').value,
    local:        document.getElementById('ec-local').value.trim(),
    equipeTexto,
    equipe:       equipeArray,
    equipeTotal:  equipeArray.reduce((s,e)=>s+(e.qtd||0),0),
    bebidasRomero: document.getElementById('ec-bebidas').value.trim(),
    cardapio: (document.getElementById('ec-cardapio')?.value||'').trim(),
  };

  sv('contratos');
  rContratos();
  document.getElementById('m-edit-contrato').style.display = 'none';
}

function novoContrato() {
  dadosContrato = {};
  document.getElementById('contrato-form').style.display = 'none';
  document.getElementById('contrato-status').textContent = '';
  ['c-nome','c-cpf','c-endereco','c-hora-inicio','c-opcao'].forEach(id => { const el=document.getElementById(id);if(el)el.value='';});
}


// ═══════════════════════════════════════════════════════
// ─── AGENDA ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════

function registrarEventoNaAgenda(ev) {
  if (!D.agenda) D.agenda = [];
  D.agenda.push({
    id: 'AG'+Date.now(),
    contratoId: ev.contratoId||'',
    nome: ev.nome, data: ev.data, tipo: ev.tipo,
    local: ev.local, convidados: ev.conv,
    hrInicio: ev.hrIni, hrFim: ev.hrFim, duracao: ev.duracao||'',
    equipe: ev.equipe||[], equipeTexto: ev.equipeTexto||'', equipeTotal: ev.equipeTotal||0,
    fonte: ev.fonte||'contrato'
  });
  sv('agenda');
}

function rAgenda() {
  const ag = D.agenda || [];
  const filtroI = document.getElementById('ag-data-ini')?.value;
  const filtroF = document.getElementById('ag-data-fim')?.value;
  const tbody = document.getElementById('ag-body');
  if (!tbody) return;

  const lista = ag.filter(ev => {
    if (filtroI && ev.data < filtroI) return false;
    if (filtroF && ev.data > filtroF) return false;
    return true;
  }).sort((a,b)=>(a.data||'').localeCompare(b.data||''));

  tbody.innerHTML = '';

  // Cidades consideradas viagem (>60km de BH)
  // Cidades confirmadas >60km de BH (Nova Lima, Contagem, Betim são Grande BH — não são viagem)
  const CIDADES_VIAGEM_AG = [
    'ponte nova','sete lagoas','pedro leopoldo','lagoa santa','vespasiano',
    'itabirito','ouro preto','mariana','congonhas','conselheiro lafaiete',
    'juiz de fora','uberlândia','uberaba','montes claros','governador valadares',
    'ipatinga','divinópolis','pará de minas','formiga','lavras','alfenas',
    'poços de caldas','três pontas','varginha','passos','patos de minas',
    'teófilo otoni','muriaé','viçosa','barbacena','são joão del rei',
    'coronel fabriciano','timóteo','caratinga','manhuaçu'
  ];

  const normalizar = s => s.toLowerCase()
    .replace(/pte\.?\s*/g,'ponte ')
    .replace(/[áàã]/g,'a').replace(/[éê]/g,'e').replace(/[íi]/g,'i')
    .replace(/[óôõ]/g,'o').replace(/[úü]/g,'u').replace(/ç/g,'c');

  const ehViagem = ev => {
    const local = normalizar(ev.local||'');
    if (CIDADES_VIAGEM_AG.some(ci => local.includes(normalizar(ci)))) return true;
    if (/por conta da romero/i.test(ev.transporte||'')) return true;
    // Cruzar com contrato salvo pelo nome+data — só verifica o local, não o transporte
    // (transporte pode estar desatualizado de versões antigas do sistema)
    const contrato = (D.contratos||[]).find(c =>
      c.data === ev.data && (c.nome === ev.nome || (c.nomeEvento||'') === ev.nome)
    );
    if (contrato) {
      const locC = normalizar(contrato.local||'');
      if (CIDADES_VIAGEM_AG.some(ci => locC.includes(normalizar(ci)))) return true;
    }
    return false;
  };

  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#8B91A8;padding:24px">Nenhum evento no período</td></tr>';
    ['ag-card-eventos','ag-card-convidados','ag-card-colab','ag-card-viagem'].forEach(id => {
      const el = document.getElementById(id); if(el) el.textContent = '—';
    });
    const vBox = document.getElementById('ag-card-viagem-box');
    if (vBox) vBox.style.borderColor = '#2A2F42';
    return;
  }

  // Totalizadores
  const totCargos = {};
  let totalConv = 0;
  let totalViagens = 0;

  lista.forEach(ev => {
    totalConv += parseInt(ev.convidados||0);
    if (ehViagem(ev)) totalViagens++;
    (ev.equipe||[]).forEach(e => {
      const c = e.cargo || 'Outros';
      totCargos[c] = (totCargos[c]||0) + (e.qtd||0);
    });
    if (!(ev.equipe||[]).length && ev.equipeTotal) {
      totCargos['Colaboradores'] = (totCargos['Colaboradores']||0) + ev.equipeTotal;
    }
  });
  const totalGeral = Object.values(totCargos).reduce((s,v)=>s+v,0);
  const totStr = Object.entries(totCargos).map(([c,n])=>`<strong>${n}</strong> ${c}`).join(' &nbsp;·&nbsp; ');

  // Atualizar cards
  const setCard = (id, v) => { const el=document.getElementById(id); if(el) el.textContent=v; };
  setCard('ag-card-eventos',    lista.length);
  setCard('ag-card-convidados', totalConv.toLocaleString('pt-BR'));
  setCard('ag-card-colab',      totalGeral || '—');
  setCard('ag-card-viagem',     totalViagens || '0');

  // Card viagem — destaque amarelo se houver
  const vBox = document.getElementById('ag-card-viagem-box');
  if (vBox) {
    if (totalViagens > 0) {
      vBox.style.borderColor = '#F7C84F';
      vBox.style.background  = '#2E2A0D';
      document.getElementById('ag-card-viagem').style.color = '#F7C84F';
    } else {
      vBox.style.borderColor = '#2A2F42';
      vBox.style.background  = '';
      document.getElementById('ag-card-viagem').style.color = '';
    }
  }

  // Detalhe equipe por cargo
  const detEl = document.getElementById('ag-detalhe-equipe');
  if (detEl) detEl.innerHTML = totalGeral
    ? `Equipe no período: ${totStr}`
    : '';

  lista.forEach(ev => {
    const equipeDisplay = ev.equipeTexto || (ev.equipeTotal ? ev.equipeTotal+' colaboradores' : '—');
    const isViagem = ehViagem(ev);
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid #1E2333';
    if (isViagem) tr.style.background = '#1A1800';
    tr.innerHTML = `
      <td style="padding:8px 12px">${fd(ev.data)}</td>
      <td style="padding:8px 12px">
        <strong>${ev.nome||'—'}</strong>
        ${isViagem ? '<span style="background:#F7C84F;color:#000;font-size:9px;font-weight:700;padding:1px 5px;border-radius:3px;margin-left:6px">✈ VIAGEM</span>' : ''}
      </td>
      <td style="padding:8px 12px">${ev.tipo||'—'}</td>
      <td style="padding:8px 12px;text-align:center">${ev.convidados||'—'}</td>
      <td style="padding:8px 12px;font-size:12px;color:#8B91A8">${ev.local||'—'}</td>
      <td style="padding:8px 12px">${ev.hrInicio||'—'}</td>
      <td style="padding:8px 12px">${ev.hrFim||'—'}</td>
      <td style="padding:8px 12px">${ev.duracao||calcDuracao(ev.hrInicio,ev.hrFim)||'—'}</td>
      <td style="padding:8px 12px;font-size:11px;line-height:1.6">${equipeDisplay}</td>
      <td style="padding:8px 12px;white-space:nowrap">
        <button class="btn-sm" onclick="abrirEdicaoAgenda('${ev.id}')">✏️</button>
        <button class="btn-sm btn-red" onclick="excluirEventoAgenda('${ev.id}')">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function calcDuracao(ini, fim) {
  try {
    const [hi, mi] = ini.split(':').map(Number);
    const [hf, mf] = fim.split(':').map(Number);
    const diff = (hf * 60 + mf) - (hi * 60 + mi);
    if (diff <= 0) return '—';
    return `${Math.floor(diff/60)}h${diff%60 ? (diff%60)+'min' : ''}`;
  } catch { return '—'; }
}

function adicionarEventoManual() {
  const nome = document.getElementById('ag-m-nome')?.value?.trim();
  const data = document.getElementById('ag-m-data')?.value;
  if (!nome || !data) { alert('Preencha ao menos nome e data.'); return; }
  const ev = {
    nome, data,
    tipo: document.getElementById('ag-m-tipo')?.value || '',
    local: document.getElementById('ag-m-local')?.value?.trim() || '',
    convidados: document.getElementById('ag-m-conv')?.value?.trim() || '',
    hrInicio: document.getElementById('ag-m-ini')?.value || '',
    hrFim: document.getElementById('ag-m-fim')?.value || '',
    equipeTexto: document.getElementById('ag-m-equipe')?.value?.trim() || '',
    equipe: [],
    equipeTotal: 0,
    fonte: 'manual'
  };
  registrarEventoNaAgenda(ev);
  rAgenda();
  // Limpar
  ['ag-m-nome','ag-m-data','ag-m-local','ag-m-conv','ag-m-ini','ag-m-fim','ag-m-equipe'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  alert('Evento adicionado!');
}

function excluirEventoAgenda(id) {
  if (!confirm('Excluir este evento da agenda?')) return;
  D.agenda = (D.agenda || []).filter(e => e.id !== id);
  sv('agenda');
  rAgenda();
}

function abrirEdicaoAgenda(id) {
  const ev = (D.agenda || []).find(e => e.id === id);
  if (!ev) return;
  document.getElementById('eag-id').value    = id;
  document.getElementById('eag-nome').value  = ev.nome || '';
  document.getElementById('eag-data').value  = ev.data || '';
  document.getElementById('eag-tipo').value  = ev.tipo || 'Casamento';
  document.getElementById('eag-conv').value  = ev.convidados || '';
  document.getElementById('eag-local').value = ev.local || '';
  document.getElementById('eag-ini').value   = ev.hrInicio || '';
  document.getElementById('eag-fim').value   = ev.hrFim || '';
  document.getElementById('eag-equipe').value= ev.equipeTexto || '';
  const modal = document.getElementById('m-edit-agenda');
  modal.style.display = 'flex';
}

function salvarEdicaoAgenda() {
  const id   = document.getElementById('eag-id').value;
  const nome = document.getElementById('eag-nome').value.trim();
  const data = document.getElementById('eag-data').value;
  if (!nome || !data) { alert('Preencha Nome e Data.'); return; }

  const idx = (D.agenda || []).findIndex(e => e.id === id);
  if (idx === -1) { alert('Evento não encontrado.'); return; }

  const equipeTexto = document.getElementById('eag-equipe').value.trim();
  const hrInicio    = document.getElementById('eag-ini').value;
  const hrFim       = document.getElementById('eag-fim').value;

  D.agenda[idx] = {
    ...D.agenda[idx],
    nome,
    data,
    tipo:        document.getElementById('eag-tipo').value,
    convidados:  document.getElementById('eag-conv').value.trim(),
    local:       document.getElementById('eag-local').value.trim(),
    hrInicio,
    hrFim,
    duracao:     calcDuracao(hrInicio, hrFim),
    equipeTexto,
  };

  sv('agenda');
  rAgenda();
  document.getElementById('m-edit-agenda').style.display = 'none';
}

// ═══════════════════════════════════════════════════════
// ─── PRODUÇÃO ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════

function setProdView(v) {
  ['lista','manual'].forEach(k => {
    const el = document.getElementById('prodview-'+k);
    if (el) el.style.display = v === k ? '' : 'none';
    const btn = document.getElementById('prod-btn-'+k);
    if (btn) btn.classList.toggle('active', v === k);
  });
  if (v === 'lista') rProducoes();
}

function inserirProducao() {
  const evento = document.getElementById('pm-evento')?.value?.trim();
  const data   = document.getElementById('pm-data')?.value;
  if (!evento || !data) { alert('Preencha Evento e Data.'); return; }
  if (!D.producoes) D.producoes = [];
  D.producoes.push({
    id: 'PRD'+Date.now(), evento, data,
    cliente: document.getElementById('pm-cliente')?.value?.trim() || '',
    convidados: document.getElementById('pm-conv')?.value?.trim() || '',
    obs: document.getElementById('pm-obs')?.value?.trim() || '',
    criadoEm: new Date().toISOString()
  });
  sv('producoes');
  ['pm-evento','pm-data','pm-cliente','pm-conv','pm-obs'].forEach(id => { const el=document.getElementById(id);if(el)el.value=''; });
  alert('Produção registrada!');
  setProdView('lista');
}

function rProducoes() {
  const lista = D.producoes || [];
  const cont = document.getElementById('prod-body');
  if (!cont) return;

  if (!lista.length) {
    cont.innerHTML = '<div style="text-align:center;color:#8B91A8;padding:32px">Nenhuma produção registrada</div>';
    return;
  }

  cont.innerHTML = '';
  [...lista].sort((a,b)=>(b.data||'').localeCompare(a.data||'')).forEach(p => {
    const div = document.createElement('div');
    div.className = 'sec';
    div.style.marginBottom = '14px';

    const equipeHtml = (p.equipe||[]).length
      ? p.equipe.map(e=>`<span style="margin-right:12px">${e.qtd} ${e.cargo}</span>`).join('')
      : (p.equipeTexto || '—');

    div.innerHTML = `
      <div class="sec-head" style="display:flex;align-items:center;gap:10px">
        <span class="sec-title">🎉 ${p.evento||p.cliente||'—'}</span>
        <span style="color:#8B91A8;font-size:12px">${fd(p.data)||''}</span>
        <button class="btn-sm" style="background:#4F8EF7;margin-left:auto" onclick="gerarFolhaProducao('${p.id}')">📄 Word</button>
        <button class="btn-sm btn-red" onclick="excluirProducao('${p.id}')">Excluir</button>
      </div>
      <div style="padding:12px 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px">

        <div><label class="lbl">PROPOSTA</label><input class="inp" type="text" value="${p.proposta||''}" placeholder="Ex: 0126-061" onchange="editarProducao('${p.id}','proposta',this.value)"></div>
        <div><label class="lbl">OCASIÃO</label><div style="color:#E8EAF0;font-size:13px">${p.tipo||'—'}</div></div>
        <div><label class="lbl">CLIENTE</label><div style="color:#E8EAF0;font-size:13px">${p.cliente||'—'}</div></div>
        <div><label class="lbl">DIA</label><div style="color:#E8EAF0;font-size:13px">${fd(p.data)||'—'}</div></div>
        <div><label class="lbl">CONVIDADOS</label><div style="color:#E8EAF0;font-size:13px">${p.convidados||'—'}</div></div>
        <div style="grid-column:1/-1"><label class="lbl">LOCAL</label><div style="color:#E8EAF0;font-size:13px">${p.local||'—'}</div></div>

        <div><label class="lbl">TRANSPORTE</label>
          <select class="inp" onchange="editarProducao('${p.id}','transporte',this.value)">
            <option ${(p.transporte||'').includes('colaborador')?'selected':''}>Por conta do colaborador</option>
            <option ${(p.transporte||'').includes('Romero')?'selected':''}>Por conta da Romero</option>
          </select>
        </div>
        <div><label class="lbl">PEÇAS</label><input class="inp" type="text" value="${p.pecas||''}" placeholder="—" onchange="editarProducao('${p.id}','pecas',this.value)"></div>
        <div><label class="lbl">CERIMONIAL</label><input class="inp" type="text" value="${p.cerimonial||''}" placeholder="—" onchange="editarProducao('${p.id}','cerimonial',this.value)"></div>
        <div><label class="lbl">DECORADOR</label><input class="inp" type="text" value="${p.decorador||''}" placeholder="—" onchange="editarProducao('${p.id}','decorador',this.value)"></div>
        <div><label class="lbl">BUFFET</label><input class="inp" type="text" value="${p.buffet||''}" placeholder="—" onchange="editarProducao('${p.id}','buffet',this.value)"></div>
        <div><label class="lbl">LAYOUT</label><input class="inp" type="text" value="${p.layout||''}" placeholder="—" onchange="editarProducao('${p.id}','layout',this.value)"></div>
        <div><label class="lbl">PONTO DE ENERGIA</label>
          <select class="inp" onchange="editarProducao('${p.id}','pontoEnergia',this.value)">
            <option value="">—</option>
            <option ${p.pontoEnergia==='SIM'?'selected':''} value="SIM">SIM</option>
            <option ${p.pontoEnergia==='NAO'?'selected':''} value="NAO">NÃO</option>
          </select>
        </div>
        <div><label class="lbl">HORÁRIO CHEGADA DA EQUIPE</label><input class="inp" type="time" value="${p.hrChegadaEquipe||''}" onchange="editarProducao('${p.id}','hrChegadaEquipe',this.value)"></div>
        <div><label class="lbl">HORÁRIO FESTA</label><div style="color:#E8EAF0;font-size:13px">${p.hrInicio||'—'} às ${p.hrFim||'—'} ${p.duracao?'· '+p.duracao:''}</div></div>
        <div><label class="lbl">HORA EXTRA (valor)</label><div style="color:#E8EAF0;font-size:13px">${p.horaExtra?'R$ '+p.horaExtra:'—'}</div></div>

        <div style="grid-column:1/-1"><label class="lbl">EQUIPE</label>
          <div style="color:#E8EAF0;font-size:13px;line-height:2">${equipeHtml}</div>
        </div>

        <div style="grid-column:1/-1"><label class="lbl">BEBIDAS CLIENTE</label><input class="inp" type="text" value="${p.bebidasCliente||''}" placeholder="Ex: Vodka (21) e Gin (18)" onchange="editarProducao('${p.id}','bebidasCliente',this.value)"></div>
        ${p.bebidasRomero?`<div style="grid-column:1/-1"><label class="lbl">BEBIDAS ROMERO</label><div style="color:#E8EAF0;font-size:13px">${p.bebidasRomero}</div></div>`:''}
        ${p.cardapio?`<div style="grid-column:1/-1"><label class="lbl">CARDÁPIO</label><div style="color:#E8EAF0;font-size:13px;white-space:pre-wrap">${p.cardapio}</div></div>`:''}
        <div style="grid-column:1/-1"><label class="lbl">OBS</label><input class="inp" type="text" value="${p.obs||''}" placeholder="—" onchange="editarProducao('${p.id}','obs',this.value)"></div>

      </div>
    `;
    cont.appendChild(div);
  });
}

function editarProducao(id, campo, valor) {
  const p = (D.producoes||[]).find(x=>x.id===id);
  if (p) { p[campo] = valor; sv('producoes'); }
}

function excluirProducao(id) {
  if (!confirm('Excluir esta produção?')) return;
  D.producoes = (D.producoes||[]).filter(p => p.id !== id);
  sv('producoes'); rProducoes();
}

async function gerarFolhaProducao(id) {
  const p = (D.producoes||[]).find(x => x.id === id);
  if (!p) return;

  const fmtData = d => {
    if (!d) return '—';
    if (d.includes('/')) return d;
    const [a,m,di] = d.split('-');
    return `${di}/${m}/${a}`;
  };

  const hrFesta = (p.hrInicio && p.hrFim)
    ? `${p.hrInicio} ÀS ${p.hrFim}${p.duracao ? ' (' + p.duracao + 'H DE FESTA)' : ''}`
    : '—';

  const horaExtra = p.horaExtra
    ? 'R$ ' + parseFloat(String(p.horaExtra).replace(/[R$\s]/g,'').replace('.','').replace(',','.'))
        .toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    : '—';

  // Monta linhas da equipe
  let equipeHtml = '';
  if (Array.isArray(p.equipe) && p.equipe.length) {
    equipeHtml = p.equipe.map(e => `<p>${String(e.qtd).padStart(2,'0')} ${e.cargo.toUpperCase()}</p>`).join('');
  } else if (p.equipeTexto) {
    equipeHtml = p.equipeTexto.split('·').map(e => `<p>${e.trim().toUpperCase()}</p>`).join('');
  }

  // Monta cardápio
  let cardapioHtml = '';
  if (p.cardapio) {
    cardapioHtml = p.cardapio.split('\n').filter(Boolean)
      .map(l => `<p>${l.trim()}</p>`).join('');
  }

  const lin = (label, val) => val && val !== '—'
    ? `<p><b>${label}:</b> ${val}</p>` : `<p><b>${label}:</b> —</p>`;

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8">
    <style>
      body { font-family: Arial, sans-serif; font-size: 11pt; margin: 2cm; color: #000; }
      h1 { color: #B8860B; font-size: 14pt; margin-bottom: 2px; }
      h2 { font-size: 12pt; border-bottom: 2px solid #B8860B; padding-bottom: 4px; margin-bottom: 12px; }
      p { margin: 4px 0; line-height: 1.4; }
      .sec { font-weight: bold; margin-top: 14px; margin-bottom: 4px; }
    </style>
    </head><body>
    <h1>ROMERO COQUETÉIS E EVENTOS</h1>
    <h2>FOLHA DE PRODUÇÃO</h2>
    ${lin('PROPOSTA', p.proposta || '—')}
    ${lin('OCASIÃO', (p.tipo||'').toUpperCase())}
    ${lin('CLIENTE', (p.cliente||'').toUpperCase())}
    ${lin('DIA', fmtData(p.data))}
    ${lin('CONVIDADOS', String(p.convidados||'—'))}
    ${lin('LOCAL', (p.local||'—').toUpperCase())}
    ${lin('TRANSPORTE', (p.transporte||'POR CONTA DO COLABORADOR').toUpperCase())}
    ${lin('PEÇAS', (p.pecas||'').toUpperCase() || '—')}
    ${lin('CERIMONIAL', (p.cerimonial||'').toUpperCase() || '—')}
    ${lin('DECORADOR', (p.decorador||'').toUpperCase() || '—')}
    ${lin('BUFFET', (p.buffet||'').toUpperCase() || '—')}
    ${lin('LAYOUT', (p.layout||'').toUpperCase() || '—')}
    ${lin('PONTO DE ENERGIA', (p.pontoEnergia||'NÃO').toUpperCase())}
    ${lin('HORÁRIO CHEGADA DA EQUIPE', p.hrChegadaEquipe || '—')}
    ${lin('HORÁRIO FESTA', hrFesta)}
    ${lin('HORA EXTRA', horaExtra)}
    <p class="sec">EQUIPE:</p>
    ${equipeHtml || '<p>—</p>'}
    ${p.bebidasCliente ? lin('BEBIDAS CLIENTE', (p.bebidasCliente||'').toUpperCase()) : ''}
    ${p.bebidasRomero  ? lin('BEBIDAS ROMERO',  (p.bebidasRomero||'').toUpperCase())  : ''}
    ${cardapioHtml ? `<p class="sec">CARDÁPIO:</p>${cardapioHtml}` : ''}
    ${p.obs ? lin('OBS', p.obs) : ''}
    </body></html>`;

  const blob = new Blob([html], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'PRODUCAO_' + (p.cliente||'evento').replace(/\s+/g,'_').toUpperCase() + '_' + (p.data||'').replace(/-/g,'') + '.doc';
  a.click();
  URL.revokeObjectURL(url);
}


// ═══════════════════════════════════════════════════════
// ─── FINANCEIRO ────────────────────────────────────────
// ═══════════════════════════════════════════════════════

function registrarParcelasFinanceiro(info) {
  if (!D.financeiro) D.financeiro = [];
  const id = 'FIN' + Date.now();
  // Parcela 1: 20% na assinatura (hoje)
  D.financeiro.push({
    id: id + 'A', contrato: info.nome, data: info.data, evento: info.nome,
    descricao: '20% — Assinatura do contrato',
    valor: 'R$ ' + info.parc1,
    valorNum: info.valorNum * 0.2,
    vencimento: new Date().toISOString().slice(0,10),
    status: 'pendente'
  });
  // Parcela 2: 80% 7 dias antes do evento
  const dtEvento = info.data ? new Date(info.data + 'T12:00:00') : null;
  let venc2 = '';
  if (dtEvento) {
    dtEvento.setDate(dtEvento.getDate() - 7);
    venc2 = dtEvento.toISOString().slice(0,10);
  }
  D.financeiro.push({
    id: id + 'B', contrato: info.nome, data: info.data, evento: info.nome,
    descricao: '80% — 7 dias antes do evento',
    valor: 'R$ ' + info.parc2,
    valorNum: info.valorNum * 0.8,
    vencimento: venc2,
    status: 'pendente'
  });
  sv('financeiro');
}

function rKpiFaturamento() {
  // Apenas admin vê os KPIs
  const kpiBox = document.getElementById('kpi-box');
  if (kpiBox) kpiBox.style.display = perfilAtual === 'admin' ? '' : 'none';
  if (perfilAtual !== 'admin') return;

  const mes = document.getElementById('kpi-mes')?.value || '';
  const ano = document.getElementById('kpi-ano')?.value || new Date().getFullYear().toString();

  // Filtra contratos pelo mês/ano da data do evento
  const contratos = (D.contratos||[]).filter(c => {
    if (!c.data) return false;
    if (ano && !c.data.startsWith(ano)) return false;
    if (mes && !c.data.startsWith(`${ano}-${mes}`)) return false;
    return true;
  });

  // Faturamento fechado = soma dos valores dos contratos filtrados
  const faturamento = contratos.reduce((s,c) => {
    const v = parseFloat((c.opcao||'0').toString().replace(/[^\d,]/g,'').replace(',','.')) || 0;
    return s + v;
  }, 0);

  // Recebido e a receber = parcelas do financeiro ligadas a esses contratos
  const eventosIds = new Set(contratos.map(c => c.nome + c.data));
  const parcelas = (D.financeiro||[]).filter(f => {
    // Filtra parcelas pelo mês/ano de vencimento OU pela data do evento
    if (ano && mes) {
      return (f.vencimento && f.vencimento.startsWith(`${ano}-${mes}`))
          || (f.data && f.data.startsWith(`${ano}-${mes}`));
    }
    if (ano) {
      return (f.vencimento && f.vencimento.startsWith(ano))
          || (f.data && f.data.startsWith(ano));
    }
    return true;
  });

  const recebido  = parcelas.filter(f=>f.status==='pago').reduce((s,f)=>s+(f.valorNum||0),0);
  const aReceber  = parcelas.filter(f=>f.status!=='pago').reduce((s,f)=>s+(f.valorNum||0),0);
  const totalConv = contratos.reduce((s,c)=>s+(parseInt(c.convidados)||0),0);
  const ticket    = contratos.length ? faturamento / contratos.length : 0;

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('kpi-fechado',    fR(faturamento));
  set('kpi-recebido',   fR(recebido));
  set('kpi-a-receber',  fR(aReceber));
  set('kpi-eventos',    contratos.length.toString());
  set('kpi-convidados', totalConv.toLocaleString('pt-BR'));
  set('kpi-ticket',     ticket ? fR(ticket) : '—');
}

function rFinanceiro() {
  rKpiFaturamento();
  const fin = D.financeiro || [];
  const tbody = document.getElementById('fin-body');
  if (!tbody) return;

  const pendentes = fin.filter(f=>f.status==='pendente');
  const pagos     = fin.filter(f=>f.status==='pago');
  const totPend   = pendentes.reduce((a,f)=>a+(f.valorNum||0),0);
  const totPago   = pagos.reduce((a,f)=>a+(f.valorNum||0),0);

  if (document.getElementById('fin-total-pend')) document.getElementById('fin-total-pend').textContent = fR(totPend);
  if (document.getElementById('fin-total-pago')) document.getElementById('fin-total-pago').textContent = fR(totPago);
  if (document.getElementById('fin-total-geral')) document.getElementById('fin-total-geral').textContent = fR(totPend+totPago);

  const filtro = document.getElementById('fin-filtro')?.value||'todos';
  const filtroI = document.getElementById('fin-data-ini')?.value||'';
  const filtroF = document.getElementById('fin-data-fim')?.value||'';

  const lista = fin
    .filter(f => filtro==='todos' || f.status===filtro)
    .filter(f => !filtroI || (f.vencimento && f.vencimento >= filtroI))
    .filter(f => !filtroF || (f.vencimento && f.vencimento <= filtroF))
    .sort((a,b)=>{
      // Sem data de vencimento vai para o fim
      if (!a.vencimento && !b.vencimento) return 0;
      if (!a.vencimento) return 1;
      if (!b.vencimento) return -1;
      return a.vencimento.localeCompare(b.vencimento);
    });

  tbody.innerHTML = '';
  if (!lista.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#8B91A8;padding:24px">Nenhum lançamento</td></tr>';
    return;
  }

  const hoje = new Date().toISOString().slice(0,10);
  lista.forEach(f => {
    const atrasado = f.status==='pendente' && f.vencimento && f.vencimento < hoje;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fd(f.vencimento)||'—'}</td>
      <td><strong>${f.evento||f.contrato||'—'}</strong></td>
      <td>${fd(f.data)||'—'}</td>
      <td>${f.tipo||'—'}</td>
      <td>${f.convidados||'—'}</td>
      <td>${f.descricao||'—'}</td>
      <td><strong>${f.valor||'—'}</strong></td>
      <td>
        <span class="tag ${f.status==='pago'?'tag-green':atrasado?'tag-red':'tag-yellow'}">
          ${f.status==='pago'?'Pago':atrasado?'Atrasado':'Pendente'}
        </span>
      </td>
      <td>
        ${f.status==='pendente'
          ?`<button class="btn-sm btn-green" onclick="marcarPago('${f.id}')">Recebido</button>`
          :`<button class="btn-sm" onclick="marcarPendente('${f.id}')">Desfazer</button>`
        }
        <button class="btn-sm btn-red" onclick="excluirFinanceiro('${f.id}')">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function marcarPago(id) {
  const f = (D.financeiro||[]).find(f => f.id === id);
  if (f) { f.status = 'pago'; sv('financeiro'); rFinanceiro(); }
}
function marcarPendente(id) {
  const f = (D.financeiro||[]).find(f => f.id === id);
  if (f) { f.status = 'pendente'; sv('financeiro'); rFinanceiro(); }
}
function excluirFinanceiro(id) {
  if (!confirm('Excluir este lançamento?')) return;
  D.financeiro = (D.financeiro||[]).filter(f => f.id !== id);
  sv('financeiro'); rFinanceiro();
}

// ═══════════════════════════════════════════════════════
// ─── EXTENSÃO DO svFirebase PARA NOVOS CAMPOS ──────────
// ═══════════════════════════════════════════════════════

// Garantir que campos existam
if (!D.agenda) D.agenda = [];
if (!D.financeiro) D.financeiro = [];
if (!D.contratos) D.contratos = [];
if (!D.producoes) D.producoes = [];
if (!D.separacoes) D.separacoes = [];
if (!D.fichas) D.fichas = [];
if (!D.regrasProp) D.regrasProp = [];
if (!D.historico) D.historico = {};
if (!D.metas) D.metas = {};

function baixarModeloCSV() {
  const linhas = [
    'MES;ANO;PAX;FATURAMENTO',
    'Janeiro;2025;525;22990',
    'Fevereiro;2025;1965;95925',
    'Março;2025;1211;59900',
    'Abril;2025;2110;149450',
    'Maio;2025;2385;171545',
    'Junho;2025;2185;156980',
    'Julho;2025;663;48625',
    'Agosto;2025;2410;180771',
    'Setembro;2025;1520;139805',
    'Outubro;2025;3005;218546',
    'Novembro;2025;2210;154555',
    'Dezembro;2025;3105;437960',
    ';;;',
    'Janeiro;2026;;',
    'Fevereiro;2026;;',
    'Março;2026;;',
    'Abril;2026;;',
    'Maio;2026;;',
    'Junho;2026;;',
    'Julho;2026;;',
    'Agosto;2026;;',
    'Setembro;2026;;',
    'Outubro;2026;;',
    'Novembro;2026;;',
    'Dezembro;2026;;',
  ];
  const blob = new Blob([linhas.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'modelo_analise_romero.csv'; a.click();
  URL.revokeObjectURL(url);
}

function revisarMeta(chave, nomeMes) {
  const atual = parseFloat((D.metas||{})[chave]?.fat||0);
  const novaStr = prompt(
    `Meta de ${nomeMes} atual: R$ ${atual.toLocaleString('pt-BR',{minimumFractionDigits:2})}\n\nDigite a nova meta (R$):`,
    atual.toFixed(2).replace('.',',')
  );
  if (novaStr === null) return;
  const nova = parseFloat(novaStr.replace(',','.'));
  if (!nova || nova <= 0) { alert('Valor inválido.'); return; }
  if (!D.metas) D.metas = {};
  if (!D.metas[chave]) D.metas[chave] = {};
  D.metas[chave].fat = nova;
  sv('metas');
  rAnalise();
}



// ═══════════════════════════════════════════════════════
// ─── PRODUÇÃO ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════

function setProdView(v) {
  ['lista','nova'].forEach(k => {
    const el = document.getElementById('prodview-' + k);
    if (el) el.style.display = v === k ? '' : 'none';
  });
  if (v === 'lista') rProducoes();
  if (v === 'nova')  rFormProducao();
}

function parsearTextoProducao(txt) {
  const get = (label) => {
    const re = new RegExp(label + '[:\\s*]+([^\\n]+)', 'i');
    const m = txt.match(re);
    return m ? m[1].replace(/\*+/g,'').trim() : '';
  };
  const cardRe = /CARD[ÁA]PIO[\s\S]*?(?=\nBEBIDAS|\nRODADAS|\nWHISKERIA|\nOBS:|$)/i;
  const cardM = txt.match(cardRe);
  const cardapio = cardM ? cardM[0].replace(/CARD[ÁA]PIO[\s*:]*/i,'').replace(/\*+/g,'').trim() : '';
  const consRe = /BEBIDAS[\s]+CONSIGNADA[S]?[\s\S]*?(?=\nBEBIDAS[\s]+CLIENTE|\nBEBIDAS[\s]+ROMERO|\nCARD|\n[A-Z]{4,}:|$)/i;
  const consM = txt.match(consRe);
  const bebidasConsignadas = consM ? consM[0].replace(/BEBIDAS[\s]+CONSIGNADA[S]?[\s*:]*/i,'').replace(/\*+/g,'').trim() : '';
  const cliRe = /BEBIDAS[\s]+CLIENTE[\s\S]*?(?=\nBEBIDAS[\s]+ROMERO|\nCARD|\n[A-Z]{4,}:|$)/i;
  const cliM = txt.match(cliRe);
  const bebidasCliente = cliM ? cliM[0].replace(/BEBIDAS[\s]+CLIENTE[\s*:]*/i,'').replace(/\*+/g,'').trim() : '';
  const romRe = /BEBIDAS[\s]+ROMERO[\s\S]*?(?=\nCARD|\n[A-Z]{4,}:|$)/i;
  const romM = txt.match(romRe);
  const bebidasRomero = romM ? romM[0].replace(/BEBIDAS[\s]+ROMERO[\s*:]*/i,'').replace(/\*+/g,'').trim() : '';
  const equipe = [];
  const equipeRe = /^(\d+)[\s]+(BARTENDER|BAR[\s-]?BACK|COORDENADOR|COPEIRO|BARBACK)/gim;
  let em;
  while ((em = equipeRe.exec(txt)) !== null) {
    equipe.push({ qtd: parseInt(em[1]), cargo: em[2].trim().toUpperCase() });
  }
  const heRe = /HORA[\s]+EXTRA[\s*:]+R\$[\s]*([\d.,]+)/i;
  const heM = txt.match(heRe);
  const durRe = /(\d+)H DE FESTA/i;
  const durM = txt.match(durRe);
  const horRe = /HORARIO[\s]+FESTA[\s*:]+([0-9:]+)[\s]+[AÀ]+S[\s]+([0-9:]+)/i;
  const horM = txt.match(horRe);
  const convRe = /CONVIDADOS[\s*:]+(\d+)/i;
  const convM = txt.match(convRe);
  return {
    proposta: get('PROPOSTA'), tipo: get('OCASI[ÃA]O'), nome: get('CLIENTE'),
    data: '', convidados: convM ? convM[1] : '', local: get('LOCAL'),
    transporte: get('TRANSPORTE'), pecas: get('PE[ÇC]AS'), cerimonial: get('CERIMONIAL'),
    decorador: get('DECORADOR'), buffet: get('BUFFET'), layout: get('LAYOUT'),
    pontoEnergia: get('PONTO DE ENERGIA'), hrChegadaEquipe: get('HORARIO DE CHEGADA DA EQUIPE'),
    hrInicio: horM ? horM[1] : '', hrFim: horM ? horM[2] : '',
    duracao: durM ? durM[1] : '', horaExtra: heM ? heM[1] : '',
    equipe, equipeTexto: equipe.map(e=>e.qtd+' '+e.cargo).join(' · '),
    equipeTotal: equipe.reduce((s,e)=>s+e.qtd,0),
    cardapio, bebidasConsignadas, bebidasCliente, bebidasRomero, obs: '',
  };
}

function rFormProducao() {
  const cont = document.getElementById('prodview-nova');
  if (!cont) return;
  // Montar lista de contratos disponíveis
  const contratos = (D.contratos||[]).sort((a,b)=>(b.data||'').localeCompare(a.data||''));
  const optsContratos = contratos.map(c=>`<option value="${c.id}">${c.nome||c.nomeEvento||'—'} · ${c.tipo||''} · ${fd(c.data)||''}</option>`).join('');

  cont.innerHTML = `
    <div class="sec">
      <div class="sec-head">
        <span class="sec-title">+ Nova Produção</span>
        <button class="btn-sm" onclick="setProdView('lista')" style="margin-left:auto">← Voltar</button>
      </div>
      <div style="padding:14px 16px">
        <div style="margin-bottom:14px">
          <label class="lbl" style="display:block;margin-bottom:6px">Importar de contrato existente</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <select id="prod-contrato-sel" class="inp" style="flex:1;min-width:280px">
              <option value="">— Selecione um contrato —</option>${optsContratos}
            </select>
            <button class="btn" onclick="puxarContrato()" style="background:var(--blue)">📥 Puxar dados do contrato</button>
          </div>
        </div>
        <div style="border-top:1px solid var(--border);padding-top:12px;margin-bottom:6px">
          <label class="lbl" style="display:block;margin-bottom:6px">Ou cole o texto manualmente</label>
          <textarea id="prod-texto-raw" rows="8" style="width:100%;font-size:11px;padding:10px;border-radius:var(--radius);border:1px solid var(--border2);background:var(--bg3);color:var(--text);font-family:var(--mono);resize:vertical" placeholder="Cole o texto da proposta/produção aqui..."></textarea>
          <button class="btn" onclick="lerTextoProducao()" style="background:var(--blue);margin-top:8px">🔍 Ler e preencher campos</button>
        </div>
      </div>
      <div id="prod-campos-extraidos" style="display:none;padding:0 16px 16px">
        <div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:12px 0 8px;border-top:1px solid var(--border);padding-top:12px">Campos extraídos — revise e edite antes de salvar</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
          <div><label class="lbl">PROPOSTA</label><input class="inp" id="pf-proposta" type="text"></div>
          <div><label class="lbl">OCASIÃO / TIPO</label><input class="inp" id="pf-tipo" type="text"></div>
          <div><label class="lbl">CLIENTE</label><input class="inp" id="pf-nome" type="text"></div>
          <div><label class="lbl">DATA DO EVENTO</label><input class="inp" id="pf-data" type="date"></div>
          <div><label class="lbl">CONVIDADOS</label><input class="inp" id="pf-convidados" type="number"></div>
          <div style="grid-column:1/-1"><label class="lbl">LOCAL</label><input class="inp" id="pf-local" type="text"></div>
          <div><label class="lbl">TRANSPORTE</label>
            <select class="inp" id="pf-transporte">
              <option value="Por conta do colaborador">Por conta do colaborador</option>
              <option value="Por conta da Romero">Por conta da Romero</option>
            </select>
          </div>
          <div><label class="lbl">PEÇAS</label><input class="inp" id="pf-pecas" type="text" placeholder="—"></div>
          <div><label class="lbl">CERIMONIAL</label><input class="inp" id="pf-cerimonial" type="text" placeholder="—"></div>
          <div><label class="lbl">DECORADOR</label><input class="inp" id="pf-decorador" type="text" placeholder="—"></div>
          <div><label class="lbl">BUFFET</label><input class="inp" id="pf-buffet" type="text" placeholder="—"></div>
          <div><label class="lbl">LAYOUT</label><input class="inp" id="pf-layout" type="text" placeholder="—"></div>
          <div><label class="lbl">PONTO DE ENERGIA</label>
            <select class="inp" id="pf-pontoenergia">
              <option value="">—</option><option value="SIM">SIM</option><option value="NAO">NÃO</option>
            </select>
          </div>
          <div><label class="lbl">CHEGADA DA EQUIPE</label><input class="inp" id="pf-chegada" type="time"></div>
          <div><label class="lbl">HORÁRIO INÍCIO</label><input class="inp" id="pf-hrini" type="time"></div>
          <div><label class="lbl">HORÁRIO FIM</label><input class="inp" id="pf-hrfim" type="time"></div>
          <div><label class="lbl">DURAÇÃO (h)</label><input class="inp" id="pf-duracao" type="number" placeholder="8"></div>
          <div><label class="lbl">HORA EXTRA (R$)</label><input class="inp" id="pf-horaextra" type="text" placeholder="—"></div>
          <div style="grid-column:1/-1"><label class="lbl">EQUIPE (uma por linha: qtd CARGO)</label>
            <textarea class="inp" id="pf-equipe" rows="4" placeholder="Ex:&#10;1 COORDENADOR&#10;6 BARTENDER&#10;2 BARBACK&#10;1 COPEIRO" style="font-size:12px;resize:vertical"></textarea>
          </div>
          <div style="grid-column:1/-1"><label class="lbl">BEBIDAS CONSIGNADAS</label>
            <textarea class="inp" id="pf-cons" rows="2" style="font-size:12px;resize:vertical"></textarea>
          </div>
          <div style="grid-column:1/-1"><label class="lbl">BEBIDAS CLIENTE</label>
            <textarea class="inp" id="pf-cli" rows="2" style="font-size:12px;resize:vertical"></textarea>
          </div>
          <div style="grid-column:1/-1"><label class="lbl">BEBIDAS ROMERO</label>
            <textarea class="inp" id="pf-romero" rows="2" style="font-size:12px;resize:vertical"></textarea>
          </div>
          <div style="grid-column:1/-1"><label class="lbl">CARDÁPIO</label>
            <textarea class="inp" id="pf-cardapio" rows="6" style="font-size:12px;resize:vertical"></textarea>
          </div>
          <div style="grid-column:1/-1"><label class="lbl">OBS</label><input class="inp" id="pf-obs" type="text" placeholder="—"></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn" id="pf-btn-salvar" onclick="salvarProducaoForm()" style="background:var(--green)">💾 Salvar Produção</button>
          <button class="btn" onclick="setProdView('lista')" style="background:var(--bg3);color:var(--text)">Cancelar</button>
        </div>
      </div>
    </div>
  `;
}


function puxarContrato() {
  const sel = document.getElementById('prod-contrato-sel');
  if (!sel || !sel.value) { alert('Selecione um contrato primeiro.'); return; }
  const c = (D.contratos||[]).find(x=>x.id===sel.value);
  if (!c) return;

  // Preencher campos do form com dados do contrato
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val||''; };
  set('pf-proposta', c.proposta||'');
  set('pf-tipo', c.tipo||c.tipoEvento||'');
  set('pf-nome', c.nome||c.nomeEvento||'');
  set('pf-data', c.data||'');
  set('pf-convidados', c.convidados||'');
  set('pf-local', c.local||'');
  // Transporte
  const tSel = document.getElementById('pf-transporte');
  if (tSel && c.transporte) tSel.value = (c.transporte||'').includes('Romero') ? 'Por conta da Romero' : 'Por conta do colaborador';
  set('pf-hrini', c.hrInicio||'');
  set('pf-hrfim', c.hrFim||'');
  set('pf-duracao', c.duracao||'');
  set('pf-horaextra', c.horaExtra||'');
  // Equipe do contrato
  if (c.equipe && Array.isArray(c.equipe)) {
    set('pf-equipe', c.equipe.map(e=>e.qtd+' '+e.cargo).join('\n'));
  } else if (c.equipeTexto) {
    set('pf-equipe', c.equipeTexto);
  }
  // Cardápio — vem da cláusula e) do contrato
  set('pf-cardapio', c.cardapio||'');
  // Aviso se cardápio vazio
  if (!c.cardapio) {
    const cardEl = document.getElementById('pf-cardapio');
    if (cardEl) {
      cardEl.placeholder = '⚠ Cardápio não encontrado neste contrato. Cole manualmente ou edite o contrato (✏️ na aba Contratos) e salve o cardápio.';
      cardEl.style.borderColor = 'var(--amber)';
    }
  }
  // Bebidas
  set('pf-cons', c.bebidasConsignadas||'');
  set('pf-cli', c.bebidasCliente||'');
  set('pf-romero', c.bebidasRomero||'');
  set('pf-obs', '');
  // Mostrar campos
  document.getElementById('prod-campos-extraidos').style.display = '';
  // Resetar botão
  const btn = document.getElementById('pf-btn-salvar');
  if (btn) { btn.textContent = '💾 Salvar Produção'; btn.onclick = salvarProducaoForm; }
  // Feedback
  document.getElementById('prod-texto-raw').value = '';
}


function prodCarregarContrato() {
  const sel = document.getElementById('prod-contrato-sel');
  if (!sel || !sel.value) { alert('Selecione um contrato primeiro.'); return; }
  const c = (D.contratos||[]).find(x=>x.id===sel.value);
  if (!c) return;

  // Preencher campos automaticamente
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val||''; };
  set('pf-tipo', c.tipo);
  set('pf-nome', c.nome||c.nomeEvento);
  set('pf-data', c.data);
  set('pf-convidados', c.convidados);
  set('pf-local', c.local);
  set('pf-hrini', c.hrInicio);
  set('pf-hrfim', c.hrFim);
  set('pf-duracao', c.duracao||'');
  set('pf-horaextra', c.horaExtra||'');
  set('pf-bebidas-cons', c.bebidasConsignadas||'');
  set('pf-cli', c.bebidasCliente||'');
  set('pf-romero', c.bebidasRomero||'');
  set('pf-cardapio', c.cardapio||'');

  // Transporte
  const tSel = document.getElementById('pf-transporte');
  if (tSel && c.transporte) tSel.value = c.transporte.includes('Romero') ? 'Por conta da Romero' : 'Por conta do colaborador';

  // Equipe
  if (c.equipe && c.equipe.length) {
    set('pf-equipe', c.equipe.map(e=>e.qtd+' '+e.cargo).join('\n'));
  } else if (c.equipeTexto) {
    set('pf-equipe', c.equipeTexto.split('·').map(e=>e.trim()).join('\n'));
  }

  // Mostrar campos
  document.getElementById('prod-campos-extraidos').style.display = '';

  // Aviso se cardápio vazio
  if (!c.cardapio) {
    const cardEl = document.getElementById('pf-cardapio');
    if (cardEl) {
      cardEl.placeholder = '⚠ Cardápio não encontrado neste contrato. Cole manualmente ou edite o contrato (✏️) e salve o cardápio.';
      cardEl.style.borderColor = 'var(--amber)';
    }
  }
}

function lerTextoProducao() {
  const txt = document.getElementById('prod-texto-raw')?.value || '';
  if (!txt.trim()) { alert('Cole o texto da produção primeiro.'); return; }
  const d = parsearTextoProducao(txt);
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('pf-proposta', d.proposta); set('pf-tipo', d.tipo); set('pf-nome', d.nome);
  set('pf-data', d.data); set('pf-convidados', d.convidados); set('pf-local', d.local);
  if (d.transporte) { const sel = document.getElementById('pf-transporte'); if (sel) sel.value = d.transporte.includes('Romero') ? 'Por conta da Romero' : 'Por conta do colaborador'; }
  set('pf-pecas', d.pecas); set('pf-cerimonial', d.cerimonial); set('pf-decorador', d.decorador);
  set('pf-buffet', d.buffet); set('pf-layout', d.layout);
  if (d.pontoEnergia) { const sel = document.getElementById('pf-pontoenergia'); if (sel) sel.value = d.pontoEnergia.toUpperCase().startsWith('S') ? 'SIM' : 'NAO'; }
  set('pf-chegada', d.hrChegadaEquipe); set('pf-hrini', d.hrInicio); set('pf-hrfim', d.hrFim);
  set('pf-duracao', d.duracao); set('pf-horaextra', d.horaExtra);
  set('pf-equipe', d.equipe.map(e=>e.qtd+' '+e.cargo).join('\n'));
  set('pf-cons', d.bebidasConsignadas); set('pf-cli', d.bebidasCliente);
  set('pf-romero', d.bebidasRomero); set('pf-cardapio', d.cardapio); set('pf-obs', d.obs);
  document.getElementById('prod-campos-extraidos').style.display = '';
  // Resetar botão para modo criação
  const btn = document.getElementById('pf-btn-salvar');
  if (btn) { btn.textContent = '💾 Salvar Produção'; btn.onclick = salvarProducaoForm; }
}

function salvarProducaoForm() {
  const get = id => document.getElementById(id)?.value?.trim() || '';
  const evento = get('pf-tipo') || get('pf-nome');
  if (!evento) { alert('Preencha pelo menos o Tipo/Ocasião do evento.'); return; }
  const equipeLinhas = get('pf-equipe').split('\n').filter(Boolean);
  const equipe = equipeLinhas.map(l => { const m = l.match(/^(\d+)\s+(.+)/); return m ? { qtd: parseInt(m[1]), cargo: m[2].trim().toUpperCase() } : null; }).filter(Boolean);
  if (!D.producoes) D.producoes = [];
  D.producoes.push({
    id: 'PRD'+Date.now(), proposta: get('pf-proposta'), evento, nomeEvento: evento,
    tipo: get('pf-tipo'), nome: get('pf-nome'), cliente: get('pf-nome'),
    data: get('pf-data'), convidados: get('pf-convidados'), local: get('pf-local'),
    transporte: get('pf-transporte'), pecas: get('pf-pecas'), cerimonial: get('pf-cerimonial'),
    decorador: get('pf-decorador'), buffet: get('pf-buffet'), layout: get('pf-layout'),
    pontoEnergia: get('pf-pontoenergia'), hrChegadaEquipe: get('pf-chegada'),
    hrInicio: get('pf-hrini'), hrFim: get('pf-hrfim'), duracao: get('pf-duracao'),
    horaExtra: get('pf-horaextra'), equipe,
    equipeTexto: equipe.map(e=>e.qtd+' '+e.cargo).join(' · '),
    equipeTotal: equipe.reduce((s,e)=>s+e.qtd,0),
    bebidasConsignadas: get('pf-cons'), bebidasCliente: get('pf-cli'),
    bebidasRomero: get('pf-romero'), cardapio: get('pf-cardapio'), obs: get('pf-obs'),
    criadoEm: new Date().toISOString()
  });
  sv('producoes'); alert('Produção salva!'); setProdView('lista');
}

function rProducoes() {
  const lista = D.producoes || [];
  const cont = document.getElementById('prod-body');
  if (!cont) return;
  if (!lista.length) { cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhuma produção registrada. Clique em "+ Nova Produção".</div>'; return; }
  cont.innerHTML = '';
  [...lista].sort((a,b)=>(b.data||'').localeCompare(a.data||'')).forEach(p => {
    const div = document.createElement('div');
    div.className = 'sec'; div.style.marginBottom = '14px';
    const equipeHtml = (p.equipe||[]).length ? p.equipe.map(e=>`<span style="margin-right:12px">${e.qtd} ${e.cargo}</span>`).join('') : (p.equipeTexto||'—');
    div.innerHTML = `
      <div class="sec-head" style="display:flex;align-items:center;gap:10px">
        <span class="sec-title">🎉 ${p.evento||p.cliente||'—'}</span>
        <span style="color:var(--text3);font-size:12px">${fd(p.data)||''}</span>
        <div style="margin-left:auto;display:flex;gap:6px">
          <button class="btn-sm" style="background:var(--green)" onclick="editarProducaoModal('${p.id}')">✏️ Editar</button>
          <button class="btn-sm btn-red" onclick="excluirProducao('${p.id}')">Excluir</button>
        </div>
      </div>
      <div style="padding:10px 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;font-size:12px">
        <div><span style="color:var(--text3)">PROPOSTA:</span> ${p.proposta||'—'}</div>
        <div><span style="color:var(--text3)">CLIENTE:</span> ${p.cliente||p.nome||'—'}</div>
        <div><span style="color:var(--text3)">DIA:</span> ${fd(p.data)||'—'}</div>
        <div><span style="color:var(--text3)">CONVIDADOS:</span> ${p.convidados||'—'}</div>
        <div><span style="color:var(--text3)">LOCAL:</span> ${p.local||'—'}</div>
        <div><span style="color:var(--text3)">HORÁRIO:</span> ${p.hrInicio||'—'} às ${p.hrFim||'—'}</div>
        <div style="grid-column:1/-1"><span style="color:var(--text3)">EQUIPE:</span> ${equipeHtml}</div>
        ${p.cardapio?`<div style="grid-column:1/-1"><span style="color:var(--text3)">CARDÁPIO:</span> <span style="white-space:pre-wrap">${p.cardapio.substring(0,200)}${p.cardapio.length>200?'…':''}</span></div>`:''}
        ${p.bebidasConsignadas?`<div style="grid-column:1/-1"><span style="color:var(--text3)">CONSIGNADO:</span> ${p.bebidasConsignadas.substring(0,120)}</div>`:''}
        ${p.bebidasRomero?`<div style="grid-column:1/-1"><span style="color:var(--text3)">ROMERO:</span> ${p.bebidasRomero}</div>`:''}
      </div>`;
    cont.appendChild(div);
  });
}

function editarProducaoModal(id) {
  const p = (D.producoes||[]).find(x=>x.id===id);
  if (!p) return;
  setProdView('nova');
  setTimeout(() => {
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val||''; };
    document.getElementById('prod-texto-raw').value = '';
    set('pf-proposta',p.proposta); set('pf-tipo',p.tipo); set('pf-nome',p.nome||p.cliente);
    set('pf-data',p.data); set('pf-convidados',p.convidados); set('pf-local',p.local);
    const tSel=document.getElementById('pf-transporte'); if(tSel&&p.transporte) tSel.value=p.transporte.includes('Romero')?'Por conta da Romero':'Por conta do colaborador';
    set('pf-pecas',p.pecas); set('pf-cerimonial',p.cerimonial); set('pf-decorador',p.decorador);
    set('pf-buffet',p.buffet); set('pf-layout',p.layout);
    const peSel=document.getElementById('pf-pontoenergia'); if(peSel&&p.pontoEnergia) peSel.value=p.pontoEnergia;
    set('pf-chegada',p.hrChegadaEquipe); set('pf-hrini',p.hrInicio); set('pf-hrfim',p.hrFim);
    set('pf-duracao',p.duracao); set('pf-horaextra',p.horaExtra);
    set('pf-equipe',(p.equipe||[]).map(e=>e.qtd+' '+e.cargo).join('\n'));
    set('pf-cons',p.bebidasConsignadas); set('pf-cli',p.bebidasCliente);
    set('pf-romero',p.bebidasRomero); set('pf-cardapio',p.cardapio); set('pf-obs',p.obs);
    document.getElementById('prod-campos-extraidos').style.display = '';
    const btn = document.getElementById('pf-btn-salvar');
    if (btn) {
      btn.textContent = '💾 Atualizar Produção';
      btn.onclick = () => {
        const idx = (D.producoes||[]).findIndex(x=>x.id===id);
        if (idx<0) return;
        const get = elId => document.getElementById(elId)?.value?.trim()||'';
        const equipeLinhas = get('pf-equipe').split('\n').filter(Boolean);
        const equipe = equipeLinhas.map(l=>{const m=l.match(/^(\d+)\s+(.+)/);return m?{qtd:parseInt(m[1]),cargo:m[2].trim().toUpperCase()}:null;}).filter(Boolean);
        const evento = get('pf-tipo')||get('pf-nome');
        D.producoes[idx] = { ...D.producoes[idx], proposta:get('pf-proposta'), tipo:get('pf-tipo'), nome:get('pf-nome'), cliente:get('pf-nome'), evento, nomeEvento:evento, data:get('pf-data'), convidados:get('pf-convidados'), local:get('pf-local'), transporte:get('pf-transporte'), pecas:get('pf-pecas'), cerimonial:get('pf-cerimonial'), decorador:get('pf-decorador'), buffet:get('pf-buffet'), layout:get('pf-layout'), pontoEnergia:get('pf-pontoenergia'), hrChegadaEquipe:get('pf-chegada'), hrInicio:get('pf-hrini'), hrFim:get('pf-hrfim'), duracao:get('pf-duracao'), horaExtra:get('pf-horaextra'), equipe, equipeTexto:equipe.map(e=>e.qtd+' '+e.cargo).join(' · '), equipeTotal:equipe.reduce((s,e)=>s+e.qtd,0), bebidasConsignadas:get('pf-cons'), bebidasCliente:get('pf-cli'), bebidasRomero:get('pf-romero'), cardapio:get('pf-cardapio'), obs:get('pf-obs') };
        sv('producoes'); alert('Produção atualizada!'); setProdView('lista');
      };
    }
  }, 100);
}

function excluirProducao(id) {
  if (!confirm('Excluir esta produção?')) return;
  D.producoes = (D.producoes||[]).filter(p=>p.id!==id);
  sv('producoes'); rProducoes();
}

// ═══════════════════════════════════════════════════════
// ─── PRODUTOS ──────────────────────────────────────────


// ── Importar produtos do MAR (Relatório Geral) ─────────
function importarProdutosDoMAR() {
  if (!MAR) { alert('Dados do estoque não disponíveis.'); return; }
  var novos = 0;
  var existentes = 0;
  if (!D.produtos) D.produtos = [];

  Object.entries(MAR).forEach(function(entry) {
    var nome = entry[0];
    var dados = entry[1];
    // Verificar se já existe (por nome exato ou alias)
    var jaExiste = D.produtos.some(function(p) {
      return p.nome === nome || (p.aliases||[]).includes(nome);
    });
    if (jaExiste) { existentes++; return; }
    // Mapear categoria do MAR para categoria do sistema
    var cat = 'OUTROS';
    var catMap = {
      'WHISKY':'BEBIDAS ALCOÓLICAS','GIN':'BEBIDAS ALCOÓLICAS','VODKA':'BEBIDAS ALCOÓLICAS',
      'RUM':'BEBIDAS ALCOÓLICAS','TEQUILA':'BEBIDAS ALCOÓLICAS','CACHACA':'BEBIDAS ALCOÓLICAS',
      'LICOR/SHOTS':'BEBIDAS ALCOÓLICAS','ESPUMANTES/VINHO':'BEBIDAS ALCOÓLICAS',
      'APERITIVOS/FORTIF.':'BEBIDAS ALCOÓLICAS','VERMUTE/BITTER':'ESPECIARIAS',
      'SEM ALCOOL':'BEBIDAS SEM ÁLCOOL','XAROPE/PURE':'XAROPES',
      'MIXING ARTESANAL':'MIX ARTESANAL','PRODUCAO':'PRODUÇÃO',
      'COPOS/TAÇAS':'COPOS E TAÇAS'
    };
    cat = catMap[dados.cat] || 'OUTROS';
    D.produtos.push({
      id: 'PRO' + Date.now() + Math.random().toString(36).slice(2,6),
      nome: nome,
      aliases: [],
      categoria: cat,
      categoriaMAR: dados.cat,
      unidade: cat === 'COPOS E TAÇAS' ? 'UN' : 'UN',
      tamanhoEmbalagem: 1,
      minimo: 0,
      obs: '',
      atualizadoEm: new Date().toISOString()
    });
    novos++;
  });

  if (novos > 0) {
    sv('produtos');
    alert('✅ ' + novos + ' produtos importados! ' + existentes + ' já existiam e foram mantidos.');
    rProdutos();
  } else {
    alert('Todos os ' + existentes + ' produtos já estavam cadastrados.');
  }
}

function initProdutos() {
  if (!D.produtos) D.produtos = [];
  setProdutosView('lista');
}

function setProdutosView(v) {
  ['lista','form'].forEach(function(x) {
    var el = document.getElementById('prd-view-' + x);
    if (el) el.style.display = x === v ? '' : 'none';
  });
  if (v === 'lista') rProdutos();
  if (v === 'form')  rFormProduto();
}

var _produtoEditandoId = null;

var UNIDADES_PRODUTO = ['UN','CX','FARDO','KG','LT','ML','PCT','PAR'];
var CATEGORIAS_PRODUTO = [
  'MATERIAL','COPOS E TAÇAS','DESCARTÁVEIS','ESPECIARIAS',
  'BEBIDAS ALCOÓLICAS','BEBIDAS SEM ÁLCOOL','HORTIFRUTI',
  'MIX ARTESANAL','PRODUÇÃO','XAROPES','KIT BARTENDER','GELO','OUTROS'
];

function rProdutos() {
  var cont = document.getElementById('prd-lista-body');
  if (!cont) return;
  var lista = (D.produtos||[]).slice().sort(function(a,b){
    return (a.categoria||'').localeCompare(b.categoria||'') || (a.nome||'').localeCompare(b.nome||'');
  });

  // Filtro de busca
  var busca = (document.getElementById('prd-busca')?.value||'').toLowerCase();
  var catFiltro = document.getElementById('prd-cat-filtro')?.value||'';
  if (busca) lista = lista.filter(function(p){
    return (p.nome||'').toLowerCase().includes(busca) ||
      (p.aliases||[]).some(function(a){return a.toLowerCase().includes(busca);});
  });
  if (catFiltro) lista = lista.filter(function(p){return p.categoria===catFiltro;});

  if (!lista.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhum produto cadastrado.<br>Clique em "+ Novo Produto" para começar.</div>';
    return;
  }

  // Agrupar por categoria
  var porCat = {};
  lista.forEach(function(p){
    if (!porCat[p.categoria||'OUTROS']) porCat[p.categoria||'OUTROS'] = [];
    porCat[p.categoria||'OUTROS'].push(p);
  });

  cont.innerHTML = Object.entries(porCat).map(function(entry){
    var cat = entry[0]; var prods = entry[1];
    return '<div style="margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;padding:6px 0;border-bottom:2px solid var(--border2);margin-bottom:6px">' +
        cat + ' <span style="font-weight:400">(' + prods.length + ')</span>' +
      '</div>' +
      '<div style="display:grid;gap:6px">' +
      prods.map(function(p){
        var badges = '';
        if (p.tamanhoEmbalagem > 1) badges += '<span style="font-size:9px;background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue-dim);padding:1px 6px;border-radius:10px;margin-left:4px">' + p.tamanhoEmbalagem + ' ' + (p.unidade||'UN') + '/cx</span>';
        if (p.minimo > 0) badges += '<span style="font-size:9px;background:var(--amber-bg);color:var(--amber);border:1px solid var(--amber-dim);padding:1px 6px;border-radius:10px;margin-left:4px">mín ' + p.minimo + '</span>';
        if (p.aliases && p.aliases.length) badges += '<span style="font-size:9px;background:var(--bg4);color:var(--text3);border:1px solid var(--border2);padding:1px 6px;border-radius:10px;margin-left:4px">' + p.aliases.length + ' alias</span>';
        return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:flex;align-items:center;gap:10px">' +
          '<div style="flex:1">' +
            '<span style="font-size:12px;font-weight:600;color:var(--text)">' + p.nome + '</span>' + badges +
            (p.aliases && p.aliases.length ? '<div style="font-size:10px;color:var(--text3);margin-top:2px">Aliases: ' + p.aliases.join(', ') + '</div>' : '') +
          '</div>' +
          '<span style="font-size:11px;color:var(--text3);font-family:var(--mono)">' + (p.unidade||'UN') + '</span>' +
          '<div style="display:flex;gap:6px">' +
            '<button class="btn-sm" style="background:var(--blue)" onclick="editarProduto(\'' + p.id + '\')">✏️</button>' +
            '<button class="btn-sm btn-red" onclick="excluirProduto(\'' + p.id + '\')">×</button>' +
          '</div>' +
        '</div>';
      }).join('') +
      '</div></div>';
  }).join('');
}

function rFormProduto(id) {
  _produtoEditandoId = id || null;
  var p = id ? (D.produtos||[]).find(function(x){return x.id===id;}) : null;
  var cont = document.getElementById('prd-view-form');
  if (!cont) return;

  var aliasesStr = p && p.aliases ? p.aliases.join(', ') : '';

  cont.innerHTML = '<div class="sec">' +
    '<div class="sec-head">' +
      '<span class="sec-title">' + (p ? '✏️ Editar Produto' : '+ Novo Produto') + '</span>' +
      '<button class="btn-sm" onclick="setProdutosView(\'lista\')" style="margin-left:auto">← Voltar</button>' +
    '</div>' +
    '<div style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">' +

      // Nome
      '<div style="grid-column:1/-1"><label class="lbl">Nome principal *</label>' +
        '<input class="inp" id="prd-nome" type="text" placeholder="Ex: ÁGUA TÔNICA LATA 350ML" value="' + (p ? p.nome : '') + '" style="text-transform:uppercase"></div>' +

      // Aliases
      '<div style="grid-column:1/-1"><label class="lbl">Aliases / variações de nome na NF</label>' +
        '<input class="inp" id="prd-aliases" type="text" placeholder="Ex: AGUA TONICA, TONICA ZERO, SCHWEPPES TONICA" value="' + aliasesStr + '">' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px">Separados por vírgula. O sistema reconhece esses nomes ao importar NFs.</div></div>' +

      // Categoria
      '<div><label class="lbl">Categoria *</label>' +
        '<select class="inp" id="prd-categoria">' +
          CATEGORIAS_PRODUTO.map(function(c){
            return '<option value="'+c+'"'+(p && p.categoria===c?' selected':'')+'>'+c+'</option>';
          }).join('') +
        '</select></div>' +

      // Unidade
      '<div><label class="lbl">Unidade de medida</label>' +
        '<select class="inp" id="prd-unidade">' +
          UNIDADES_PRODUTO.map(function(u){
            return '<option value="'+u+'"'+(p && p.unidade===u?' selected':'')+'>'+u+'</option>';
          }).join('') +
        '</select></div>' +

      // Tamanho embalagem
      '<div><label class="lbl">Qtd por embalagem (caixa/fardo)</label>' +
        '<input class="inp" id="prd-embalagem" type="number" min="1" value="' + (p && p.tamanhoEmbalagem ? p.tamanhoEmbalagem : 1) + '" placeholder="1">' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px">Ex: fardo de 12, caixa de 15. Use 1 se não se aplica.</div></div>' +

      // Mínimo
      '<div><label class="lbl">Quantidade mínima</label>' +
        '<input class="inp" id="prd-minimo" type="number" min="0" value="' + (p && p.minimo ? p.minimo : 0) + '" placeholder="0">' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px">Nunca levar menos que isso. 0 = sem mínimo.</div></div>' +

      // OBS
      '<div style="grid-column:1/-1"><label class="lbl">Observações</label>' +
        '<input class="inp" id="prd-obs" type="text" placeholder="—" value="' + (p ? (p.obs||'') : '') + '"></div>' +

    '</div>' +
    '<div style="padding:0 16px 16px;display:flex;gap:8px">' +
      '<button class="btn" onclick="salvarProduto()" style="background:var(--green)">💾 Salvar</button>' +
      '<button class="btn" onclick="setProdutosView(\'lista\')" style="background:var(--bg3);color:var(--text)">Cancelar</button>' +
    '</div>' +
  '</div>';
}

function salvarProduto() {
  var nome = (document.getElementById('prd-nome')?.value||'').trim().toUpperCase();
  if (!nome) { alert('Preencha o nome do produto.'); return; }

  var aliasesRaw = (document.getElementById('prd-aliases')?.value||'').trim();
  var aliases = aliasesRaw ? aliasesRaw.split(',').map(function(a){return a.trim().toUpperCase();}).filter(Boolean) : [];

  var prod = {
    id: _produtoEditandoId || ('PRO'+Date.now()),
    nome: nome,
    aliases: aliases,
    categoria: document.getElementById('prd-categoria')?.value || 'OUTROS',
    unidade: document.getElementById('prd-unidade')?.value || 'UN',
    tamanhoEmbalagem: parseInt(document.getElementById('prd-embalagem')?.value)||1,
    minimo: parseFloat(document.getElementById('prd-minimo')?.value)||0,
    obs: document.getElementById('prd-obs')?.value||'',
    atualizadoEm: new Date().toISOString()
  };

  if (!D.produtos) D.produtos = [];
  if (_produtoEditandoId) {
    var idx = D.produtos.findIndex(function(p){return p.id===_produtoEditandoId;});
    if (idx>=0) D.produtos[idx] = prod;
    else D.produtos.push(prod);
  } else {
    // Verificar se já existe com esse nome
    if (D.produtos.find(function(p){return p.nome===nome;})) {
      if (!confirm('Já existe um produto com esse nome. Criar mesmo assim?')) return;
    }
    D.produtos.push(prod);
  }

  sv('produtos');
  alert('Produto salvo!');
  setProdutosView('lista');
}

function editarProduto(id) {
  setProdutosView('form');
  setTimeout(function(){ rFormProduto(id); }, 50);
}

function excluirProduto(id) {
  if (!confirm('Excluir este produto?')) return;
  D.produtos = (D.produtos||[]).filter(function(p){return p.id!==id;});
  sv('produtos');
  rProdutos();
}

// Buscar produto pelo nome (para reconhecimento de NF e separação)
function buscarProdutoPorNome(nome) {
  if (!nome) return null;
  var nomeNorm = nome.trim().toUpperCase();
  return (D.produtos||[]).find(function(p){
    if (p.nome === nomeNorm) return true;
    return (p.aliases||[]).some(function(a){return a === nomeNorm;});
  }) || null;
}

// Arredondar quantidade para múltiplo da embalagem
function arredondarEmbalagem(qtd, produto) {
  if (!produto || !produto.tamanhoEmbalagem || produto.tamanhoEmbalagem <= 1) {
    return Math.max(qtd, produto ? (produto.minimo||0) : 0);
  }
  var emb = produto.tamanhoEmbalagem;
  var min = produto.minimo || 0;
  var qtdFinal = Math.max(qtd, min);
  if (qtdFinal === 0) return 0;
  // Arredondar para cima até o múltiplo de embalagem
  return Math.ceil(qtdFinal / emb) * emb;
}


// ─── REGRAS E CÁLCULOS ─────────────────────────────────

// ── Lista completa de itens da folha de separação ──────

// Itens disponíveis na FICHA DE COQUETEL (específicos do coquetel)
// Não inclui itens calculados automaticamente (equipe, gelo, material base, kit bartender, descartáveis gerais)
var ITENS_FICHA_COQUETEL = {
  "BEBIDAS ALCOÓLICAS": [
    "VODKA ABSOLUT 1000ML","GIM BEEFEATER 750ML","GIM TANQUERAY","TEQUILA",
    "RUM HAVANA","ESPUMANTE LE BLANC","LICOR 43","CAMPARI","WHISKEY JAMESON 750ML",
    "VERMUTE CARPANO 950ML","APEROL","CACHAÇA SPIRAL","FERNET","BANANINHA",
    "FIREBALL","MANZA"
  ],
  "COPOS E TAÇAS": [
    "TAÇA XTAR","CANECA DE COBRE","COPO BAIXO TIMELLES","COPO LONGO REVEL",
    "COPO LONGO ELYSIA","COPO BAIXO ELYSIA","COPO WHISKY XTAR","TAÇA COUPE TIMELESS",
    "TUBO DE ENSAIO","TAÇA CALISE AMERICA","COPO LONGO LISO NOVO","COPO WHISKY ELYSIA",
    "COPO WHISKY LISO","COPO WHISKEY TIMELESS"
  ],
  "HORTIFRUTI": [
    "LIMÃO TAITI","LIMÃO SICILIANO","MORANGO","GRAPEFRUIT","LARANJA BAHIA",
    "UVA VERDE","HORTELÃ","MANJERICÃO","ALECRIM","TOMILHO","PEPINO",
    "FLOR COMESTÍVEL","MARACUJÁ","PERA","MAÇÃ VERDE","CASCA DE LIMÃO"
  ],
  "ESPECIARIAS": [
    "ANGOSTURA 200ML (RESERVA)","ANGOSTURA 50ML","SAL DE PÁPRICAS",
    "BITTER DE LARANJA","EMULSIFICANTE","INFUSÃO","DESIDRATADOS"
  ],
  "MIX ARTESANAL": [
    "SODA GINGER ALE","SODA GRAPEFRUIT","ESPUMA DE GENGIBRE","ESPUMA DE LIMÃO SICILIANO",
    "ESPUMA DE LIMÃO","MIX FRUTAS VERMELHAS"
  ],
  "PRODUÇÃO": [
    "SUCO DE LIMÃO","XAROPE DE AÇÚCAR","CAFÉ","MIX AÇÚCAR DE BAUNILHA E MARACUJÁ",
    "MIX FRUTAS VERMELHAS"
  ],
  "XAROPES": [
    "LICOR DE CAFÉ","PURE MONIN PERA 1000ML","XAROPE LICHIA","XAROPE MORANGO",
    "XAROPE MARACUJÁ","XAROPE TANGERINA","XAROPE CARAMELO","XAROPE CUCUMBER",
    "XAROPE PÊSSEGO","XAROPE FRAMBOESA","XAROPE BAUNILHA"
  ],
  "MATERIAL (ESPECÍFICO)": [
    "DESCASCADOR","MACERADOR","TESOURA","PRATINHO PRETO",
    "GARRAFA SOUR","GARRAFA SIMPLES","PALITO DE ACRÍLICO"
  ]
};

function getItensFicha() {
  // Se tiver biblioteca personalizada, usar; mas filtrar só categorias da ficha
  var bib = getBiblioteca();
  var resultado = {};
  var CATS_FICHA = Object.keys(ITENS_FICHA_COQUETEL);
  
  Object.entries(bib).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    // Verificar se é categoria da ficha
    var catFicha = CATS_FICHA.find(function(c) {
      return cat === c || cat === c.replace(' (ESPECÍFICO)','');
    });
    if (catFicha) {
      resultado[catFicha] = resultado[catFicha] 
        ? resultado[catFicha].concat(itens.filter(function(i){ return !resultado[catFicha].includes(i); }))
        : itens.slice();
    }
  });
  
  // Se resultado vazio, usar padrão
  if (!Object.keys(resultado).length) {
    return JSON.parse(JSON.stringify(ITENS_FICHA_COQUETEL));
  }
  return resultado;
}

var ITENS_FOLHA = {
  "EQUIPE": ["COORDENADOR","BARTENDER","BAR BACK","COPEIRO"],
  "GELO": ["GELO CUBO 4KG","GELO TRANSLÚCIDO"],
  "BEBIDAS SEM ÁLCOOL": ["ÁGUA TÔNICA","ÁGUA COM GÁS"],
  "COPOS E TAÇAS": [
    "TAÇA XTAR","CANECA DE COBRE","COPO BAIXO TIMELLES","COPO LONGO REVEL",
    "COPO LONGO ELYSIA","COPO BAIXO ELYSIA","COPO WHISKY XTAR","TAÇA COUPE TIMELESS",
    "TUBO DE ENSAIO","TAÇA CALISE AMERICA","COPO LONGO LISO NOVO","COPO WHISKY ELYSIA",
    "COPO WHISKY LISO","COPO WHISKEY TIMELESS"
  ],
  "MATERIAL": [
    "TAPETE","PRATINHO PRETO","GARRAFA SOUR","GARRAFA SIMPLES","MIXING GLASS",
    "BOWL PRETO","PÁ DE GELO","COQUETELEIRA COMPLETA","FUNIL","TÁBUA DE CORTE",
    "FACA PRETA","DOSADOR","DESCASCADOR","PENEIRA DE INOX - PEQUENA","MINI RALO",
    "BIQUEIRA","BAILARINA","MACERADOR","PINÇA","PEGADOR DE GELO","STREINER",
    "BALDE COPA","ESCORREDOR","DETERGENTE 500ML","BUCHA AMARELA","COOLER DE REPOSIÇÃO",
    "TÉRMICA PRETA","CAIXA TÉRMICA","SUPORTE PARA TÉRMICA","CAIXA AZUL DE GELO",
    "CUBA PRETA","LIXEIRA","RÁDIO","TESOURA","COLHER BAILARINA","PANO DE PRATO",
    "TABUA DE CORTE","MIXING GLASS"
  ],
  "DESCARTÁVEIS": [
    "ÁLCOOL","GUARDANAPO","CANUDO DE PLÁSTICO","SACO DE LIXO","COPO DESCARTÁVEL",
    "PALITO DE ACRÍLICO","PANO DE PRATO"
  ],
  "ESPECIARIAS": [
    "ANGOSTURA 200ML (RESERVA)","ANGOSTURA 50ML","ADOÇANTE","SAL DE PÁPRICAS",
    "BITTER DE LARANJA","EMULSIFICANTE","INFUSÃO","DESIDRATADOS"
  ],
  "HORTIFRUTI": [
    "LIMÃO TAITI","LIMÃO SICILIANO","MORANGO","GRAPEFRUIT","LARANJA BAHIA",
    "UVA VERDE","HORTELÃ","MANJERICÃO","ALECRIM","TOMILHO","PEPINO",
    "FLOR COMESTÍVEL","MARACUJÁ","PERA","MAÇÃ VERDE","CASCA DE LIMÃO"
  ],
  "BEBIDAS ALCOÓLICAS": [
    "VODKA ABSOLUT 1000ML","GIM BEEFEATER 750ML","GIM TANQUERAY","TEQUILA",
    "RUM HAVANA","ESPUMANTE LE BLANC","LICOR 43","CAMPARI","WHISKEY JAMESON 750ML",
    "VERMUTE CARPANO 950ML","APEROL","CACHAÇA SPIRAL","FERNET","BANANINHA",
    "FIREBALL","MANZA"
  ],
  "MIX ARTESANAL": [
    "SODA GINGER ALE","SODA GRAPEFRUIT","ESPUMA DE GENGIBRE","ESPUMA DE LIMÃO SICILIANO",
    "ESPUMA DE LIMÃO","MIX FRUTAS VERMELHAS"
  ],
  "PRODUÇÃO": [
    "SUCO DE LIMÃO","XAROPE DE AÇÚCAR","CAFÉ","MIX AÇÚCAR DE BAUNILHA E MARACUJÁ",
    "MIX FRUTAS VERMELHAS"
  ],
  "XAROPES": [
    "LICOR DE CAFÉ","PURE MONIN PERA 1000ML","XAROPE LICHIA","XAROPE MORANGO",
    "XAROPE MARACUJÁ","XAROPE TANGERINA","XAROPE CARAMELO","XAROPE CUCUMBER",
    "XAROPE PÊSSEGO","XAROPE FRAMBOESA","XAROPE BAUNILHA"
  ],
  "KIT BARTENDER": ["LANCHE","REFEIÇÃO","UNIFORME"]
};

// ── Regras padrão para cada item ───────────────────────
// tipo: 'bartender' | 'convidado' | 'fixo' | 'cardapio' | 'equipe'
// valor: divisor ou quantidade fixa
// min: quantidade mínima sempre levada
// soSeCardapio: true = só aparece se tiver coquetel associado

var REGRAS_ITENS_PADRAO = [
  // KIT BARTENDER
  {item:"LANCHE",        cat:"KIT BARTENDER", tipo:"equipe",    valor:1, min:1},
  {item:"REFEIÇÃO",      cat:"KIT BARTENDER", tipo:"equipe",    valor:1, min:1},
  {item:"UNIFORME",      cat:"KIT BARTENDER", tipo:"equipe",    valor:1, min:1},
  // GELO
  {item:"GELO CUBO 4KG",    cat:"GELO", tipo:"convidado", valor:5,  min:10, obs:"Ajustar por horário/temperatura"},
  {item:"GELO TRANSLÚCIDO", cat:"GELO", tipo:"convidado", valor:1,  min:0,  soSeCardapio:true},
  // ÁGUA
  {item:"ÁGUA TÔNICA",   cat:"BEBIDAS SEM ÁLCOOL", tipo:"convidado", valor:5, min:6},
  {item:"ÁGUA COM GÁS",  cat:"BEBIDAS SEM ÁLCOOL", tipo:"convidado", valor:5, min:6},
  // MATERIAL — base bartender
  {item:"TAPETE",              cat:"MATERIAL", tipo:"bartender", valor:2, min:2},
  {item:"PRATINHO PRETO",      cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"GARRAFA SOUR",        cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"GARRAFA SIMPLES",     cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"MIXING GLASS",        cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"BOWL PRETO",          cat:"MATERIAL", tipo:"bartender", valor:2, min:2},
  {item:"PÁ DE GELO",          cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"COQUETELEIRA COMPLETA",cat:"MATERIAL",tipo:"bartender", valor:2, min:2},
  {item:"FUNIL",               cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"TÁBUA DE CORTE",      cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"FACA PRETA",          cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"DOSADOR",             cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"DESCASCADOR",         cat:"MATERIAL", tipo:"bartender", valor:1, min:1, soSeCardapio:true},
  {item:"PENEIRA DE INOX - PEQUENA",cat:"MATERIAL",tipo:"bartender",valor:1,min:1},
  {item:"MINI RALO",           cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"BIQUEIRA",            cat:"MATERIAL", tipo:"bartender", valor:2, min:2},
  {item:"BAILARINA",           cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"MACERADOR",           cat:"MATERIAL", tipo:"bartender", valor:1, min:1, soSeCardapio:true},
  {item:"PINÇA",               cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"PEGADOR DE GELO",     cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"STREINER",            cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"BALDE COPA",          cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"ESCORREDOR",          cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"DETERGENTE 500ML",    cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"BUCHA AMARELA",       cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"COOLER DE REPOSIÇÃO", cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"TÉRMICA PRETA",       cat:"MATERIAL", tipo:"bartender", valor:2, min:1},
  {item:"CAIXA TÉRMICA",       cat:"MATERIAL", tipo:"fixo",      valor:2, min:2},
  {item:"SUPORTE PARA TÉRMICA",cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"CAIXA AZUL DE GELO",  cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"CUBA PRETA",          cat:"MATERIAL", tipo:"bartender", valor:2, min:1},
  {item:"LIXEIRA",             cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"RÁDIO",               cat:"MATERIAL", tipo:"equipe",    valor:1, min:1},
  {item:"TESOURA",             cat:"MATERIAL", tipo:"fixo",      valor:1, min:1},
  {item:"COLHER BAILARINA",    cat:"MATERIAL", tipo:"bartender", valor:1, min:1},
  {item:"PANO DE PRATO",       cat:"MATERIAL", tipo:"bartender", valor:1, min:2},
  // DESCARTÁVEIS
  {item:"ÁLCOOL",              cat:"DESCARTÁVEIS", tipo:"fixo",      valor:1, min:1},
  {item:"GUARDANAPO",          cat:"DESCARTÁVEIS", tipo:"convidado", valor:25,min:3},
  {item:"CANUDO DE PLÁSTICO",  cat:"DESCARTÁVEIS", tipo:"convidado", valor:50,min:1},
  {item:"SACO DE LIXO",        cat:"DESCARTÁVEIS", tipo:"bartender", valor:1, min:3},
  {item:"COPO DESCARTÁVEL",    cat:"DESCARTÁVEIS", tipo:"fixo",      valor:1, min:1},
  {item:"PALITO DE ACRÍLICO",  cat:"DESCARTÁVEIS", tipo:"convidado", valor:10,min:0, soSeCardapio:true},
  // ESPECIARIAS — só se cardápio
  {item:"ANGOSTURA 200ML (RESERVA)",cat:"ESPECIARIAS",tipo:"fixo",valor:1,min:0,soSeCardapio:true},
  {item:"ANGOSTURA 50ML",      cat:"ESPECIARIAS", tipo:"bartender",valor:1,min:0, soSeCardapio:true},
  {item:"ADOÇANTE",            cat:"ESPECIARIAS", tipo:"fixo",      valor:1, min:1},
  // PRODUÇÃO
  {item:"SUCO DE LIMÃO",       cat:"PRODUÇÃO", tipo:"convidado", valor:20, min:2, obs:"Litros"},
  {item:"XAROPE DE AÇÚCAR",    cat:"PRODUÇÃO", tipo:"convidado", valor:20, min:2, obs:"Litros"},
  {item:"MIX FRUTAS VERMELHAS",cat:"PRODUÇÃO", tipo:"convidado", valor:20, min:2, soSeCardapio:true},
];

function getRegrasItens() {
  return (D.regrasItens && D.regrasItens.length) ? D.regrasItens : JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
}

function calcQtdItem(regra, conv, bartenders, equipeTotal) {
  var v = parseFloat(regra.valor) || 1;
  var min = parseFloat(regra.min) || 0;
  var qtd = min;
  if (regra.tipo === 'bartender') qtd = Math.max(min, bartenders * v);
  else if (regra.tipo === 'convidado') qtd = Math.max(min, Math.ceil(conv / v));
  else if (regra.tipo === 'equipe') qtd = Math.max(min, equipeTotal * v);
  else if (regra.tipo === 'fixo') qtd = Math.max(min, v);
  return Math.ceil(qtd);
}

// ── Módulo Regras e Cálculos ────────────────────────────

// ── Biblioteca de Itens ─────────────────────────────────
function rBiblioteca() {
  var cont = document.getElementById('regras-view-biblioteca');
  if (!cont) return;

  // Usar itens salvos ou padrão (verificar se tem chaves, não só se existe)
  var biblioteca = (D.bibliotecaItens && Object.keys(D.bibliotecaItens).length) ? D.bibliotecaItens : JSON.parse(JSON.stringify(ITENS_FOLHA));

  var html = '<div style="padding:14px 16px">' +
    '<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Gerencie a lista de itens disponíveis para seleção nas fichas de coquetéis e nas regras de proporção.</div>' +

    // Adicionar novo item
    '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:16px">' +
      '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Adicionar novo item</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">' +
        '<div style="flex:1;min-width:160px"><label class="lbl">Categoria</label>' +
          '<select id="bib-cat" class="inp" style="width:100%">' +
            Object.keys(biblioteca).map(function(c){return '<option value="'+c+'">'+c+'</option>';}).join('') +
          '</select>' +
        '</div>' +
        '<div style="flex:2;min-width:200px"><label class="lbl">Nome do item</label>' +
          '<input class="inp" id="bib-nome" type="text" placeholder="Ex: LIMÃO CRAVO" style="width:100%">' +
        '</div>' +
        '<button class="btn" onclick="adicionarItemBiblioteca()" style="background:var(--green);white-space:nowrap">+ Adicionar</button>' +
      '</div>' +
      '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:12px 0 6px">Nova categoria</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        '<input class="inp" id="bib-nova-cat" type="text" placeholder="Ex: FLORES COMESTÍVEIS" style="flex:1;min-width:200px">' +
        '<button class="btn" onclick="adicionarCategoriaBiblioteca()" style="background:var(--blue);white-space:nowrap">+ Criar categoria</button>' +
      '</div>' +
    '</div>' +

    // Lista por categoria
    '<div style="display:grid;gap:12px">';

  Object.entries(biblioteca).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">' +
      '<div style="padding:8px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px">' +
        '<span style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;flex:1">' + cat + ' <span style="color:var(--text3);font-weight:400">(' + itens.length + ' itens)</span></span>' +
        '<button class="btn-sm btn-red" onclick="excluirCat(this)" data-cat="' + cat + '" title="Excluir categoria inteira">🗑️ Cat.</button>' +
      '</div>' +
      '<div style="padding:8px;display:flex;flex-wrap:wrap;gap:6px">' +
        itens.map(function(item) {
          return '<span style="display:inline-flex;align-items:center;gap:4px;background:var(--bg4);border:1px solid var(--border2);border-radius:20px;padding:3px 10px;font-size:11px;color:var(--text2)">' +
            item +
            '<button onclick="excluirBibItem(this)" data-cat="' + cat + '" data-item="' + item + '" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px;padding:0;margin-left:2px;line-height:1" title="Remover">×</button>' +
          '</span>';
        }).join('') +
      '</div>' +
    '</div>';
  });

  html += '</div></div>';
  cont.innerHTML = html;
}

function adicionarItemBiblioteca() {
  var cat = document.getElementById('bib-cat')?.value;
  var nome = (document.getElementById('bib-nome')?.value||'').trim().toUpperCase();
  if (!cat || !nome) { alert('Preencha categoria e nome.'); return; }

  if (!D.bibliotecaItens) D.bibliotecaItens = JSON.parse(JSON.stringify(ITENS_FOLHA));
  if (!D.bibliotecaItens[cat]) D.bibliotecaItens[cat] = [];
  if (D.bibliotecaItens[cat].includes(nome)) { alert('Item já existe nesta categoria.'); return; }
  D.bibliotecaItens[cat].push(nome);
  D.bibliotecaItens[cat].sort();
  sv('bibliotecaItens');
  document.getElementById('bib-nome').value = '';
  rBiblioteca();
}

function adicionarCategoriaBiblioteca() {
  var nome = (document.getElementById('bib-nova-cat')?.value||'').trim().toUpperCase();
  if (!nome) { alert('Digite o nome da categoria.'); return; }
  if (!D.bibliotecaItens) D.bibliotecaItens = JSON.parse(JSON.stringify(ITENS_FOLHA));
  if (D.bibliotecaItens[nome]) { alert('Categoria já existe.'); return; }
  D.bibliotecaItens[nome] = [];
  sv('bibliotecaItens');
  document.getElementById('bib-nova-cat').value = '';
  rBiblioteca();
}

function excluirItemBiblioteca(cat, item) {
  if (!confirm('Remover "' + item + '" de ' + cat + '?')) return;
  if (!D.bibliotecaItens) D.bibliotecaItens = JSON.parse(JSON.stringify(ITENS_FOLHA));
  D.bibliotecaItens[cat] = (D.bibliotecaItens[cat]||[]).filter(function(i){return i!==item;});
  sv('bibliotecaItens');
  rBiblioteca();
}

function excluirCategoria(cat) {
  if (!confirm('Excluir a categoria inteira "' + cat + '" e todos seus itens?')) return;
  if (!D.bibliotecaItens) D.bibliotecaItens = JSON.parse(JSON.stringify(ITENS_FOLHA));
  delete D.bibliotecaItens[cat];
  sv('bibliotecaItens');
  rBiblioteca();
}


function excluirCat(btn) {
  var cat = btn.dataset.cat;
  excluirCategoria(cat);
}
function excluirBibItem(btn) {
  var cat = btn.dataset.cat;
  var item = btn.dataset.item;
  excluirItemBiblioteca(cat, item);
}
function getBiblioteca() {
  return D.bibliotecaItens && Object.keys(D.bibliotecaItens).length
    ? D.bibliotecaItens
    : JSON.parse(JSON.stringify(ITENS_FOLHA));
}


function initRegras() {
  if (!D.fichas) D.fichas = [];
  if (!D.regrasItens) D.regrasItens = [];
if (!D.bibliotecaItens) D.bibliotecaItens = {};
if (!D.produtos) D.produtos = [];
  setRegrasView('fichas');
}

function setRegrasView(v) {
  ['fichas','proporcoes','nova-ficha','biblioteca'].forEach(function(x) {
    var el = document.getElementById('regras-view-' + x);
    if (el) el.style.display = x === v ? '' : 'none';
    var btn = document.getElementById('regras-tab-' + x);
    if (btn) btn.classList.toggle('active', x === v);
  });
  if (v === 'fichas') rFichas();
  if (v === 'proporcoes') rProporcoes();
  if (v === 'nova-ficha') rFormFicha();
  if (v === 'biblioteca') rBiblioteca();
}

// ── Fichas de Coquetéis ─────────────────────────────────
function rFichas() {
  var cont = document.getElementById('fichas-body');
  if (!cont) return;
  var fichas = D.fichas || [];
  if (!fichas.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhuma ficha cadastrada.<br>Cadastre seus coquetéis para que a separação seja preenchida automaticamente.</div>';
    return;
  }
  cont.innerHTML = fichas.map(function(f) {
    var porCat = {};
    (f.itens||[]).forEach(function(i) { if(!porCat[i.cat]) porCat[i.cat]=[]; porCat[i.cat].push(i.nome); });
    return '<div class="sec" style="margin-bottom:10px">' +
      '<div class="sec-head" style="display:flex;align-items:center;gap:10px">' +
        '<span class="sec-title">🍹 ' + f.nome + '</span>' +
        (f.variantes ? '<span style="color:var(--text3);font-size:11px">' + f.variantes + '</span>' : '') +
        '<div style="margin-left:auto;display:flex;gap:6px">' +
          '<button class="btn-sm" style="background:var(--blue)" onclick="editarFicha(\'' + f.id + '\')">✏️ Editar</button>' +
          '<button class="btn-sm btn-red" onclick="excluirFicha(\'' + f.id + '\')">Excluir</button>' +
        '</div>' +
      '</div>' +
      '<div style="padding:8px 16px;display:flex;flex-wrap:wrap;gap:12px;font-size:11px">' +
        Object.entries(porCat).map(function(e) {
          return '<div><span style="color:var(--text3);font-weight:600">' + e[0] + ':</span> ' + e[1].join(', ') + '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }).join('');
}

function rFormFicha(fichaExistente) {
  var cont = document.getElementById('regras-view-nova-ficha');
  if (!cont) return;
  var f = fichaExistente || { nome:'', variantes:'', itens:[] };
  var itensIds = new Set((f.itens||[]).map(function(i){return i.cat+'|'+i.nome;}));

  // Itens da ficha existente que não estão na nova lista filtrada
  var itensFicha = getItensFicha();
  var todosItensNovos = new Set();
  Object.entries(itensFicha).forEach(function(e){ e[1].forEach(function(i){ todosItensNovos.add(e[0]+'|'+i); }); });
  var itensExtras = fichaExistente ? (fichaExistente.itens||[]).filter(function(i){ return !todosItensNovos.has(i.cat+'|'+i.nome); }) : [];

  var html = '<div class="sec"><div class="sec-head">' +
    '<span class="sec-title">' + (fichaExistente ? '✏️ Editar Ficha' : '+ Nova Ficha de Coquetel') + '</span>' +
    '<button class="btn-sm" onclick="setRegrasView(\'fichas\')" style="margin-left:auto">← Voltar</button>' +
    '</div><div style="padding:14px 16px">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">' +
      '<div><label class="lbl">Nome do Coquetel *</label>' +
        '<input class="inp" id="fc-nome" type="text" placeholder="Ex: FITZGERALD" value="' + f.nome + '" style="text-transform:uppercase"></div>' +
      '<div><label class="lbl">Variantes / Aliases</label>' +
        '<input class="inp" id="fc-variantes" type="text" placeholder="Ex: FITZ, FITZGERAL" value="' + (f.variantes||'') + '">' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px">Nomes alternativos separados por vírgula</div></div>' +
    '</div>' +
    '<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Marque os itens que este coquetel precisa</div>' +
    '<div id="fc-itens-container">';

  Object.entries(getItensFicha()).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    html += '<div style="margin-bottom:14px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
      itens.map(function(item) {
        var checked = itensIds.has(cat+'|'+item) ? 'checked' : '';
        return '<label style="display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;background:var(--bg3);padding:3px 8px;border-radius:var(--radius);border:1px solid var(--border)">' +
          '<input type="checkbox" data-cat="' + cat + '" data-nome="' + item + '" ' + checked + ' style="cursor:pointer"> ' + item + '</label>';
      }).join('') +
      '</div></div>';
  });

  html += '</div>' +
    '<div style="margin-top:8px">' +
      '<label class="lbl" style="display:block;margin-bottom:4px">Item personalizado</label>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px">' +
        '<select id="fc-custom-cat" class="inp" style="width:180px">' +
          Object.keys(getItensFicha()).map(function(cat){return '<option value="'+cat+'">'+cat+'</option>';}).join('') +
        '</select>' +
        '<input class="inp" id="fc-custom-nome" type="text" placeholder="Nome do item" style="flex:1;min-width:150px">' +
        '<button class="btn" onclick="adicionarItemCustom()" style="background:var(--blue)">+ Adicionar</button>' +
      '</div>' +
      '<div id="fc-custom-lista" style="display:flex;flex-wrap:wrap;gap:6px"></div>' +
    '</div>' +
    // Itens extras (já na ficha mas fora da lista atual)
    (itensExtras.length ? 
      '<div style="margin-top:14px;background:var(--bg3);border:1px solid var(--border2);border-radius:var(--radius);padding:10px 12px">' +
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Itens já associados (fora das categorias padrão)</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
        itensExtras.map(function(item) {
          return '<label style="display:flex;align-items:center;gap:5px;font-size:11px;cursor:pointer;background:var(--bg4);padding:3px 8px;border-radius:var(--radius);border:1px solid var(--blue-dim)">' +
            '<input type="checkbox" data-cat="' + item.cat + '" data-nome="' + item.nome + '" checked style="cursor:pointer"> ' +
            '<span style="color:var(--text3)">' + item.cat + ':</span> ' + item.nome + '</label>';
        }).join('') +
        '</div>' +
      '</div>'
    : '') +
    '<div style="display:flex;gap:8px;margin-top:16px">' +
      '<button class="btn" id="pf-btn-salvar-ficha" onclick="salvarFicha(\'' + (fichaExistente ? fichaExistente.id : '') + '\')" style="background:var(--green)">💾 Salvar Ficha</button>' +
      '<button class="btn" onclick="setRegrasView(\'fichas\')" style="background:var(--bg3);color:var(--text)">Cancelar</button>' +
    '</div></div></div>';

  cont.innerHTML = html;
  window._customItens = [];

  if (fichaExistente) {
    var todosItens = new Set(Object.entries(ITENS_FOLHA).flatMap(function(e){return e[1].map(function(i){return e[0]+'|'+i;});}));
    (fichaExistente.itens||[]).filter(function(i){return !todosItens.has(i.cat+'|'+i.nome);}).forEach(function(i){
      adicionarTagCustom(i.cat, i.nome);
    });
  }
}

if (!window._customItens) window._customItens = [];

function adicionarItemCustom() {
  var cat = document.getElementById('fc-custom-cat')?.value;
  var nome = (document.getElementById('fc-custom-nome')?.value||'').trim().toUpperCase();
  if (!nome) return;
  adicionarTagCustom(cat, nome);
  document.getElementById('fc-custom-nome').value = '';
}

function adicionarTagCustom(cat, nome) {
  var id = 'cx'+Date.now()+Math.random().toString(36).slice(2);
  window._customItens.push({id:id, cat:cat, nome:nome});
  var cont = document.getElementById('fc-custom-lista');
  if (!cont) return;
  var tag = document.createElement('span');
  tag.style.cssText = 'display:inline-flex;align-items:center;gap:5px;background:var(--blue-bg);border:1px solid var(--blue-dim);color:var(--blue);padding:3px 10px;border-radius:20px;font-size:11px';
  tag.dataset.id = id;
  tag.innerHTML = cat + ': ' + nome + ' <span style="cursor:pointer;font-weight:700" onclick="removerCustom(\'' + id + '\',this.parentElement)">×</span>';
  cont.appendChild(tag);
}

function removerCustom(id, el) {
  window._customItens = (window._customItens||[]).filter(function(x){return x.id!==id;});
  if (el) el.remove();
}

function salvarFicha(idExistente) {
  var nome = (document.getElementById('fc-nome')?.value||'').trim().toUpperCase();
  if (!nome) { alert('Preencha o nome do coquetel.'); return; }
  var variantes = (document.getElementById('fc-variantes')?.value||'').trim();
  var itens = [];
  document.querySelectorAll('#fc-itens-container input[type="checkbox"]:checked').forEach(function(cb){
    itens.push({cat:cb.dataset.cat, nome:cb.dataset.nome});
  });
  (window._customItens||[]).forEach(function(i){itens.push({cat:i.cat, nome:i.nome});});
  if (!D.fichas) D.fichas = [];
  if (idExistente) {
    var idx = D.fichas.findIndex(function(f){return f.id===idExistente;});
    if (idx>=0) D.fichas[idx] = {id:idExistente, nome:nome, variantes:variantes, itens:itens};
  } else {
    D.fichas.push({id:'FIC'+Date.now(), nome:nome, variantes:variantes, itens:itens, criadoEm:new Date().toISOString()});
  }
  window._customItens = [];
  sv('fichas');
  alert('Ficha salva!');
  setRegrasView('fichas');
}

function editarFicha(id) {
  var f = (D.fichas||[]).find(function(x){return x.id===id;});
  if (!f) return;
  window._customItens = [];
  setRegrasView('nova-ficha');
  setTimeout(function(){rFormFicha(f);}, 50);
}

function excluirFicha(id) {
  if (!confirm('Excluir esta ficha?')) return;
  D.fichas = (D.fichas||[]).filter(function(f){return f.id!==id;});
  sv('fichas'); rFichas();
}

// ── Regras de Proporção ─────────────────────────────────
function rProporcoes() {
  var cont = document.getElementById('regras-prop-body');
  if (!cont) return;
  var regras = getRegrasItens();

  var porCat = {};
  regras.forEach(function(r) {
    if (!porCat[r.cat]) porCat[r.cat] = [];
    porCat[r.cat].push(r);
  });

  var html = '<div style="font-size:12px;color:var(--text3);margin-bottom:14px">Defina como cada item é calculado. As quantidades são geradas automaticamente na folha de separação.</div>';

  Object.entries(porCat).forEach(function(entry) {
    var cat = entry[0]; var itens = entry[1];
    html += '<div style="margin-bottom:16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:2px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:grid;gap:6px">';

    itens.forEach(function(r, idx) {
      var ri = regras.indexOf(r);
      html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px;display:grid;grid-template-columns:180px 1fr 80px 80px 80px;gap:8px;align-items:center;font-size:11px">' +
        '<span style="color:var(--text);font-weight:500">' + r.item + '</span>' +
        '<div style="display:flex;align-items:center;gap:6px">' +
          '<select onchange="atualizarRegra(' + ri + ',\'tipo\',this.value)" style="font-size:10px;padding:3px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text)">' +
            ['bartender','convidado','equipe','fixo'].map(function(t){
              return '<option value="'+t+'"'+(r.tipo===t?' selected':'')+'>'+t+'</option>';
            }).join('') +
          '</select>' +
          '<span style="color:var(--text3);font-size:10px">' +
            (r.tipo==='bartender'?'× bartenders':r.tipo==='convidado'?'÷ convidados':r.tipo==='equipe'?'× equipe':'fixo') +
          '</span>' +
        '</div>' +
        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">VALOR</div>' +
          '<input type="number" value="' + r.valor + '" min="0" step="0.5" style="width:100%;font-size:11px;padding:3px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center" onchange="atualizarRegra(' + ri + ',\'valor\',parseFloat(this.value))">' +
        '</div>' +
        '<div><div style="font-size:9px;color:var(--text3);margin-bottom:2px">MÍNIMO</div>' +
          '<input type="number" value="' + r.min + '" min="0" style="width:100%;font-size:11px;padding:3px 6px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center" onchange="atualizarRegra(' + ri + ',\'min\',parseFloat(this.value))">' +
        '</div>' +
        '<div style="text-align:center">' +
          '<label style="font-size:9px;color:var(--text3);display:block;margin-bottom:2px">SÓ C/ COQUET.</label>' +
          '<input type="checkbox" ' + (r.soSeCardapio?'checked':'') + ' onchange="atualizarRegra(' + ri + ',\'soSeCardapio\',this.checked)" style="cursor:pointer">' +
        '</div>' +
      '</div>';
    });

    html += '</div></div>';
  });

  // Botão para adicionar item personalizado
  html += '<div style="margin-top:8px;display:flex;gap:8px">' +
    '<button class="btn" onclick="adicionarItemRegra()" style="background:var(--blue)">+ Novo Item</button>' +
    '<button class="btn" onclick="salvarRegrasItens()" style="background:var(--green)">💾 Salvar Regras</button>' +
    '<button class="btn" onclick="resetarRegras()" style="background:var(--red-dim);color:var(--red)">↺ Restaurar Padrão</button>' +
  '</div>';

  cont.innerHTML = html;
}

function atualizarRegra(idx, campo, valor) {
  var regras = getRegrasItens();
  if (!D.regrasItens || !D.regrasItens.length) D.regrasItens = JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
  if (D.regrasItens[idx]) D.regrasItens[idx][campo] = valor;
}

function salvarRegrasItens() {
  sv('regrasItens');
  alert('Regras salvas!');
}

function resetarRegras() {
  if (!confirm('Restaurar todas as regras para o padrão?')) return;
  D.regrasItens = JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
  sv('regrasItens');
  rProporcoes();
}

function adicionarItemRegra() {
  var nome = prompt('Nome do item:');
  if (!nome) return;
  var cat = prompt('Categoria (ex: MATERIAL, ESPECIARIAS, PRODUÇÃO):') || 'MATERIAL';
  if (!D.regrasItens || !D.regrasItens.length) D.regrasItens = JSON.parse(JSON.stringify(REGRAS_ITENS_PADRAO));
  D.regrasItens.push({item:nome.toUpperCase(), cat:cat.toUpperCase(), tipo:'fixo', valor:1, min:1, soSeCardapio:false});
  rProporcoes();
}

// ── Cruzar cardápio com fichas ──────────────────────────
function cruzarCardapioComFichas(cardapioTexto) {
  if (!cardapioTexto || !(D.fichas||[]).length) return {};
  // resultado[cat][item] = { count, coqueteis: ['FITZGERALD', 'NEGRONI', ...] }
  var resultado = {};
  var linhas = cardapioTexto.split('\n').filter(Boolean);
  linhas.forEach(function(linha) {
    var linhaNorm = linha.toUpperCase().replace(/[-•*]/g,'').trim();
    (D.fichas||[]).forEach(function(ficha) {
      var nomes = [ficha.nome].concat((ficha.variantes||'').split(',').map(function(v){return v.trim();})).filter(Boolean);
      var encontrou = nomes.some(function(n){ return linhaNorm.includes(n.toUpperCase()); });
      if (encontrou && ficha.itens) {
        ficha.itens.forEach(function(item) {
          if (!resultado[item.cat]) resultado[item.cat] = {};
          if (!resultado[item.cat][item.nome]) resultado[item.cat][item.nome] = { count: 0, coqueteis: [] };
          resultado[item.cat][item.nome].count++;
          if (!resultado[item.cat][item.nome].coqueteis.includes(ficha.nome)) {
            resultado[item.cat][item.nome].coqueteis.push(ficha.nome);
          }
        });
      }
    });
  });
  return resultado;
}

// ─── SEPARAÇÃO ─────────────────────────────────────────

function initSeparacao() {
  if (!D.separacoes) D.separacoes = [];
  setSepView('lista');
}

function setSepView(v) {
  ['lista','nova','detalhe'].forEach(function(x) {
    var el = document.getElementById('sep-view-'+x);
    if (el) el.style.display = x===v ? '' : 'none';
  });
  if (v==='lista') rSeparacoes();
  if (v==='nova')  rSepNova();
}

function rSeparacoes() {
  var cont = document.getElementById('sep-lista-body');
  if (!cont) return;
  var lista = (D.separacoes||[]).slice().sort(function(a,b){return (b.data||'').localeCompare(a.data||'');});
  if (!lista.length) {
    cont.innerHTML = '<div style="text-align:center;color:var(--text3);padding:32px;font-size:13px">Nenhuma folha gerada. Clique em "+ Nova Folha".</div>';
    return;
  }
  cont.innerHTML = lista.map(function(s) {
    return '<div class="sec" style="margin-bottom:10px">' +
      '<div class="sec-head" style="display:flex;align-items:center;gap:10px">' +
        '<span class="sec-title">📋 ' + (s.evento||'—') + '</span>' +
        '<span style="color:var(--text3);font-size:12px">' + (fd(s.data)||'') + '</span>' +
        '<span style="color:var(--text3);font-size:11px">' + (s.convidados||'—') + ' convidados</span>' +
        '<div style="margin-left:auto;display:flex;gap:6px">' +
          '<button class="btn-sm" style="background:var(--blue)" onclick="abrirSeparacao(\'' + s.id + '\')">✏️ Ver / Editar</button>' +
          '<button class="btn-sm" style="background:#6C63FF" onclick="imprimirSeparacao(\'' + s.id + '\')">🖨️ Imprimir</button>' +
          '<button class="btn-sm btn-red" onclick="excluirSeparacao(\'' + s.id + '\')">Excluir</button>' +
        '</div>' +
      '</div>' +
      '<div style="padding:6px 16px;font-size:11px;color:var(--text3)">' + (s.local||'') + ' · Equipe: ' + (s.totalEquipe||'—') + ' · Bartenders: ' + (s.bartenders||'—') + '</div>' +
    '</div>';
  }).join('');
}

function rSepNova() {
  var cont = document.getElementById('sep-nova-body');
  if (!cont) return;
  var producoes = (D.producoes||[]).slice().sort(function(a,b){return (b.data||'').localeCompare(a.data||'');});
  var opts = producoes.map(function(p){
    return '<option value="' + p.id + '">' + (p.evento||p.cliente||'—') + ' · ' + (fd(p.data)||'') + '</option>';
  }).join('');
  cont.innerHTML = '<div style="padding:16px">' +
    '<label class="lbl" style="display:block;margin-bottom:6px">Selecionar evento *</label>' +
    '<select id="sep-prod-sel" class="inp" onchange="sepCarregarProducao(this.value)" style="width:100%;max-width:480px">' +
      '<option value="">— Selecione o evento —</option>' + opts +
    '</select>' +
    '<div id="sep-form-campos" style="display:none;margin-top:16px"></div>' +
  '</div>';
}

function sepCarregarProducao(prodId) {
  if (!prodId) return;
  var p = (D.producoes||[]).find(function(x){return x.id===prodId;});
  if (!p) return;

  var conv = parseInt(p.convidados)||0;
  var equipe = p.equipe||[];
  var bartenders = equipe.filter(function(e){return (e.cargo||'').toLowerCase().includes('bartender');})
    .reduce(function(s,e){return s+(parseInt(e.qtd)||0);},0) || Math.max(1,Math.ceil(conv/30));
  var equipeTotal = equipe.reduce(function(s,e){return s+(parseInt(e.qtd)||0);},0) || bartenders;

  // Itens removidos desta separação (persistidos no D via campo temporário)
  var _sepRemovidosKey = 'sep_removidos_' + prodId;
  if (!window._sepRemovidosMap) window._sepRemovidosMap = {};
  if (!window._sepRemovidosMap[prodId]) window._sepRemovidosMap[prodId] = [];

  // Cruzar cardápio com fichas — retorna { cat: { item: {count, coqueteis} } }
  var itensCardapio = cruzarCardapioComFichas(p.cardapio||'');
  var temFichas = Object.keys(itensCardapio).length > 0;

  // Identificar coquetéis do cardápio e quais têm ficha
  var coqueteisCardapio = []; // [{nome, temFicha, itens:[]}]
  if (p.cardapio) {
    var linhasCard = p.cardapio.split('\n').filter(Boolean);
    linhasCard.forEach(function(linha) {
      var linhaNorm = linha.toUpperCase().replace(/[-•*:]/g,'').trim();
      if (!linhaNorm || linhaNorm.length < 3) return;
      var fichaEncontrada = null;
      (D.fichas||[]).forEach(function(ficha) {
        var nomes = [ficha.nome].concat((ficha.variantes||'').split(',').map(function(v){return v.trim();})).filter(Boolean);
        if (nomes.some(function(n){return linhaNorm.includes(n.toUpperCase());})) {
          fichaEncontrada = ficha;
        }
      });
      coqueteisCardapio.push({
        nome: linha.trim(),
        nomeLimpo: linhaNorm,
        temFicha: !!fichaEncontrada,
        ficha: fichaEncontrada
      });
    });
  }

  var regras = getRegrasItens();
  var cont = document.getElementById('sep-form-campos');
  if (!cont) return;
  cont.style.display = '';

  // Classificar categorias por seção
  var CATS_KIT_BASE = ['MATERIAL','DESCARTÁVEIS','ESPECIARIAS','KIT BARTENDER'];
  var CATS_CONFERENCIA = ['BEBIDAS SEM ÁLCOOL','GELO','COPOS E TAÇAS','PRODUÇÃO','XAROPES'];

  // Calcular todos os itens
  var todosItens = {}; // cat -> [item]
  regras.forEach(function(r) {
    var itensDoCardapio = itensCardapio[r.cat] && itensCardapio[r.cat][r.item];
    var coquetelDoItem = itensDoCardapio ? itensCardapio[r.cat][r.item].coqueteis : [];
    if (r.soSeCardapio && !itensDoCardapio && r.min === 0) return;
    if (!todosItens[r.cat]) todosItens[r.cat] = [];
    var qtd = calcQtdItem(r, conv, bartenders, equipeTotal);
    todosItens[r.cat].push({
      item: r.item, qtd: qtd,
      doCardapio: !!itensDoCardapio,
      coqueteis: coquetelDoItem || [],
      soSeCardapio: r.soSeCardapio, obs: r.obs||'',
      semFicha: r.soSeCardapio && !itensDoCardapio && r.min > 0
    });
  });

  var equipeHtml = equipe.length
    ? equipe.map(function(e){return '<span style="margin-right:10px">'+e.qtd+' '+e.cargo+'</span>';}).join('')
    : (p.equipeTexto||'—');

  // ── Cabeçalho do evento
  var html = '<div style="background:var(--bg3);border-radius:var(--radius);padding:10px 14px;margin-bottom:14px;border:1px solid var(--border);font-size:12px">' +
    '<strong>' + (p.evento||p.cliente||'—') + '</strong> · ' + (fd(p.data)||'—') + ' · ' + (p.hrInicio||'—') + '–' + (p.hrFim||'—') + '<br>' +
    '<span style="color:var(--text3)">' + conv + ' convidados · ' + (p.local||'—') + '</span><br>' +
    '<span style="color:var(--text3)">Equipe: ' + equipeHtml + '</span>' +
  '</div>';

  html += '<div style="display:grid;gap:16px">';

  // ══════════════════════════════════════════════════════
  // SEÇÃO 1 — COQUETÉIS
  // ══════════════════════════════════════════════════════
  html += '<div style="background:var(--bg2);border:2px solid var(--blue-dim);border-radius:var(--radius-lg);overflow:hidden">' +
    '<div style="padding:10px 14px;background:var(--blue-bg);border-bottom:1px solid var(--blue-dim);display:flex;align-items:center;gap:8px">' +
      '<span style="font-size:12px;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:.8px">🍹 Coquetéis</span>' +
      '<span style="font-size:11px;color:var(--text3)">Insumos por coquetel — confira cada item</span>' +
    '</div>';

  if (coqueteisCardapio.length === 0) {
    html += '<div style="padding:14px;font-size:12px;color:var(--text3)">Nenhum coquetel no cardápio ou cardápio não preenchido.</div>';
  } else {
    coqueteisCardapio.forEach(function(coq, coqIdx) {
      // Verificar se foi removido desta separação
      var removidos = window._sepRemovidosMap[prodId] || [];
      if (removidos.includes(coq.nomeLimpo)) return;

      var corBorda = coq.temFicha ? 'var(--green-dim)' : 'var(--amber-dim)';
      var corTitulo = coq.temFicha ? 'var(--green)' : 'var(--amber)';
      var bgTitulo = coq.temFicha ? 'var(--green-bg)' : 'var(--amber-bg)';
      var icone = coq.temFicha ? '✅' : '⚠️';
      var nomeEsc = coq.nomeLimpo.replace(/'/g,"\\'");

      html += '<div style="border-bottom:1px solid var(--border);padding:0">';
      html += '<div style="padding:8px 14px;background:' + bgTitulo + ';border-left:3px solid ' + corBorda + ';display:flex;align-items:center;gap:8px">' +
        '<span style="font-size:12px;font-weight:600;color:' + corTitulo + '">' + icone + ' ' + coq.nome + '</span>' +
        '<div style="margin-left:auto;display:flex;gap:6px;align-items:center">' +
          (!coq.temFicha ? '<button class="btn-sm" onclick="irParaCadastroFicha()" style="background:var(--amber-dim);color:var(--amber)">+ Cadastrar ficha</button>' : '') +
          '<button class="btn-sm" data-nomecoq="' + coq.nomeLimpo + '" data-prodid="' + prodId + '" onclick="removerItemSeparacao(this.dataset.nomecoq,this.dataset.prodid)" style="background:var(--red-dim);color:var(--red)" title="Remover desta separação">✕ Remover</button>' +
        '</div>' +
      '</div>';

      if (coq.temFicha && coq.ficha) {
        var itensCoquetel = coq.ficha.itens || [];
        if (itensCoquetel.length) {
          html += '<div style="padding:6px 0">';
          itensCoquetel.forEach(function(item) {
            var qtdItem = 0;
            if (todosItens[item.cat]) {
              var found = todosItens[item.cat].find(function(x){return x.item===item.nome;});
              if (found) qtdItem = found.qtd;
            }
            html += '<div style="display:grid;grid-template-columns:1fr 100px;gap:8px;align-items:center;padding:4px 14px;border-bottom:1px solid var(--border)">' +
              '<div style="font-size:12px;color:var(--text)">' +
                '<span style="font-size:10px;color:var(--text3);margin-right:6px">' + item.cat + '</span>' + item.nome +
              '</div>' +
              '<input type="number" value="' + qtdItem + '" min="0" ' +
                'data-item="' + item.nome.replace(/"/g,'') + '" data-cat="' + item.cat.replace(/"/g,'') + '" ' +
                'style="font-size:12px;font-weight:600;padding:4px 8px;border-radius:4px;border:1px solid var(--green-dim);background:var(--bg);color:var(--green);text-align:center;font-family:var(--mono)">' +
            '</div>';
          });
          html += '</div>';
        } else {
          html += '<div style="padding:8px 14px;font-size:11px;color:var(--text3)">Ficha sem itens cadastrados.</div>';
        }
      } else if (!coq.temFicha) {
        html += '<div style="padding:8px 14px;font-size:11px;color:var(--amber)">Sem ficha — quantidades não calculadas automaticamente.</div>';
      }

      html += '</div>';
    });

    // Mostrar itens removidos (para poder restaurar)
    var removidosAtivos = (window._sepRemovidosMap[prodId]||[]).filter(function(r){
      return coqueteisCardapio.some(function(c){return c.nomeLimpo===r;});
    });
    if (removidosAtivos.length) {
      html += '<div style="padding:8px 14px;border-top:1px solid var(--border)">' +
        '<div style="font-size:10px;color:var(--text3);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">Itens removidos desta separação</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
        removidosAtivos.map(function(r) {
          var coq = coqueteisCardapio.find(function(c){return c.nomeLimpo===r;});
          var nomeEsc = r.replace(/'/g,"\'");
          return '<span style="display:inline-flex;align-items:center;gap:5px;background:var(--bg4);border:1px solid var(--border2);border-radius:20px;padding:3px 10px;font-size:11px;color:var(--text3)">' +
            (coq ? coq.nome : r) +
            '<button data-nomecoq="' + r + '" data-prodid="' + prodId + '" onclick="restaurarItemSeparacao(this.dataset.nomecoq,this.dataset.prodid)" style="background:none;border:none;color:var(--green);cursor:pointer;font-size:11px;padding:0;margin-left:4px" title="Restaurar">↩ restaurar</button>' +
          '</span>';
        }).join('') +
        '</div>' +
      '</div>';
    }
  }

  html += '</div>'; // fim seção coquetéis

  // ══════════════════════════════════════════════════════
  // SEÇÃO 2 — CONFERÊNCIA
  // ══════════════════════════════════════════════════════
  html += '<div style="background:var(--bg2);border:2px solid var(--border2);border-radius:var(--radius-lg);overflow:hidden">' +
    '<div style="padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border2);display:flex;align-items:center;gap:8px">' +
      '<span style="font-size:12px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:.8px">📋 Conferência</span>' +
      '<span style="font-size:11px;color:var(--text3)">Bebidas, gelo, copos, produção, equipe</span>' +
    '</div>';

  // Equipe
  html += '<div style="border-bottom:1px solid var(--border)">' +
    '<div style="padding:6px 14px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;background:var(--bg3)">EQUIPE</div>';
  equipe.forEach(function(e) {
    html += '<div style="display:grid;grid-template-columns:1fr 100px;gap:8px;align-items:center;padding:4px 14px;border-bottom:1px solid var(--border)">' +
      '<span style="font-size:12px;color:var(--text)">' + e.cargo + '</span>' +
      '<input type="number" value="' + e.qtd + '" min="0" data-item="' + e.cargo + '" data-cat="EQUIPE" ' +
        'style="font-size:12px;font-weight:600;padding:4px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center;font-family:var(--mono)">' +
    '</div>';
  });
  html += '</div>';

  // Bebidas alcoólicas
  var bebidasAlc = [p.bebidasConsignadas, p.bebidasRomero, p.bebidasCliente].filter(Boolean).join('\n');
  html += '<div style="border-bottom:1px solid var(--border)">' +
    '<div style="padding:6px 14px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;background:var(--bg3)">BEBIDAS ALCOÓLICAS</div>' +
    '<div style="padding:8px 14px"><textarea class="inp" id="sep-bebidas-alc" rows="4" style="font-size:12px;resize:vertical;width:100%">' + bebidasAlc + '</textarea></div>' +
  '</div>';

  // Categorias de conferência calculadas
  CATS_CONFERENCIA.forEach(function(cat) {
    var itens = todosItens[cat];
    if (!itens || !itens.length) return;
    html += '<div style="border-bottom:1px solid var(--border)">' +
      '<div style="padding:6px 14px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;background:var(--bg3)">' + cat + '</div>';
    itens.forEach(function(it) {
      var badge = it.doCardapio
        ? '<span style="font-size:9px;background:var(--green-bg);color:var(--green);border:1px solid var(--green-dim);padding:1px 6px;border-radius:10px;margin-left:6px">' + it.coqueteis.join(', ') + '</span>'
        : it.semFicha ? '<span style="font-size:9px;background:var(--amber-bg);color:var(--amber);border:1px solid var(--amber-dim);padding:1px 6px;border-radius:10px;margin-left:6px">⚠️</span>' : '';
      html += '<div style="display:grid;grid-template-columns:1fr 100px;gap:8px;align-items:center;padding:4px 14px;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:12px;color:var(--text)">' + it.item + badge +
          (it.obs ? '<span style="font-size:10px;color:var(--text3);margin-left:6px">' + it.obs + '</span>' : '') +
        '</div>' +
        '<input type="number" value="' + it.qtd + '" min="0" ' +
          'data-item="' + it.item.replace(/"/g,'') + '" data-cat="' + cat.replace(/"/g,'') + '" ' +
          'style="font-size:12px;font-weight:600;padding:4px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text);text-align:center;font-family:var(--mono)">' +
      '</div>';
    });
    html += '</div>';
  });

  html += '</div>'; // fim seção conferência

  // ══════════════════════════════════════════════════════
  // SEÇÃO 3 — KIT BASE
  // ══════════════════════════════════════════════════════
  html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden">' +
    '<div style="padding:10px 14px;background:var(--bg3);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between">' +
      '<div>' +
        '<span style="font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.8px">🔧 Kit Base</span>' +
        '<span style="font-size:11px;color:var(--text3);margin-left:8px">Calculado automaticamente — menos conferência</span>' +
      '</div>' +
      '<button onclick="toggleKitBase(this)" style="font-size:10px;background:none;border:1px solid var(--border2);color:var(--text3);padding:3px 8px;border-radius:4px;cursor:pointer">▼ Ver itens</button>' +
    '</div>' +
    '<div id="sep-kit-base" style="display:none">';

  CATS_KIT_BASE.forEach(function(cat) {
    var itens = todosItens[cat];
    if (!itens || !itens.length) return;
    html += '<div style="border-bottom:1px solid var(--border)">' +
      '<div style="padding:6px 14px;font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;background:var(--bg3)">' + cat + '</div>';
    itens.forEach(function(it) {
      html += '<div style="display:grid;grid-template-columns:1fr 100px;gap:8px;align-items:center;padding:4px 14px;border-bottom:1px solid var(--border)">' +
        '<span style="font-size:12px;color:var(--text2)">' + it.item +
          (it.obs ? '<span style="font-size:10px;color:var(--text3);margin-left:6px">' + it.obs + '</span>' : '') +
        '</span>' +
        '<input type="number" value="' + it.qtd + '" min="0" ' +
          'data-item="' + it.item.replace(/"/g,'') + '" data-cat="' + cat.replace(/"/g,'') + '" ' +
          'style="font-size:12px;padding:4px 8px;border-radius:4px;border:1px solid var(--border2);background:var(--bg);color:var(--text2);text-align:center;font-family:var(--mono)">' +
      '</div>';
    });
    html += '</div>';
  });

  html += '</div></div>'; // fim kit base

  // Coquetéis (campo oculto para impressão)
  html += '<input type="hidden" id="sep-coqueteis" value="' + (p.cardapio||'').replace(/"/g,'&quot;') + '">';

  // Campos ocultos
  html += '<input type="hidden" id="sep-prod-id" value="' + prodId + '">' +
    '<input type="hidden" id="sep-conv" value="' + conv + '">' +
    '<input type="hidden" id="sep-bt" value="' + bartenders + '">' +
    '<input type="hidden" id="sep-total-equipe" value="' + equipeTotal + '">';

  html += '</div>'; // fim grid

  html += '<div style="display:flex;gap:8px;margin-top:14px">' +
    '<button class="btn" onclick="salvarSeparacao()" style="background:var(--green)">💾 Gerar Folha</button>' +
    '<button class="btn" onclick="setSepView(\'lista\')" style="background:var(--bg3);color:var(--text)">Cancelar</button>' +
  '</div>';

  cont.innerHTML = html;
}


function removerItemSeparacao(nomeLimpo, prodId) {
  if (!window._sepRemovidosMap) window._sepRemovidosMap = {};
  if (!window._sepRemovidosMap[prodId]) window._sepRemovidosMap[prodId] = [];
  if (!window._sepRemovidosMap[prodId].includes(nomeLimpo)) {
    window._sepRemovidosMap[prodId].push(nomeLimpo);
  }
  sepCarregarProducao(prodId);
}

function restaurarItemSeparacao(nomeLimpo, prodId) {
  if (!window._sepRemovidosMap || !window._sepRemovidosMap[prodId]) return;
  window._sepRemovidosMap[prodId] = window._sepRemovidosMap[prodId].filter(function(r){return r!==nomeLimpo;});
  sepCarregarProducao(prodId);
}

function irParaCadastroFicha() {
  setSepView('lista');
  setTimeout(function(){ go('regras'); setRegrasView('nova-ficha'); }, 100);
}

function toggleKitBase(btn) {
  var el = document.getElementById('sep-kit-base');
  if (!el) return;
  if (el.style.display === 'none') {
    el.style.display = '';
    btn.textContent = '▲ Ocultar itens';
  } else {
    el.style.display = 'none';
    btn.textContent = '▼ Ver itens';
  }
}


function salvarSeparacao() {
  var prodId = document.getElementById('sep-prod-id')?.value;
  if (!prodId) { alert('Selecione um evento primeiro.'); return; }
  var p = (D.producoes||[]).find(function(x){return x.id===prodId;});
  if (!p) return;

  var conv = parseInt(document.getElementById('sep-conv')?.value)||0;
  var bt   = parseInt(document.getElementById('sep-bt')?.value)||0;
  var teq  = parseInt(document.getElementById('sep-total-equipe')?.value)||0;

  // Coletar todos os itens com quantidades editadas
  var itensFinais = {};
  document.querySelectorAll('[data-item][data-cat]').forEach(function(input) {
    var cat = input.dataset.cat;
    var item = input.dataset.item;
    var qtd = parseInt(input.value)||0;
    if (!itensFinais[cat]) itensFinais[cat] = {};
    itensFinais[cat][item] = qtd;
  });

  var sep = {
    id: 'SEP'+Date.now(),
    producaoId: prodId,
    evento: p.evento||p.cliente||'',
    cliente: p.cliente||'',
    data: p.data||'',
    convidados: conv,
    local: p.local||'',
    hrInicio: p.hrInicio||'',
    hrFim: p.hrFim||'',
    equipe: p.equipe||[],
    equipeTexto: p.equipeTexto||'',
    bartenders: bt,
    totalEquipe: teq,
    itens: itensFinais,
    bebidasAlc: document.getElementById('sep-bebidas-alc')?.value||'',
    coqueteis: document.getElementById('sep-coqueteis')?.value||'',
    criadoEm: new Date().toISOString()
  };

  if (!D.separacoes) D.separacoes = [];
  var idx = D.separacoes.findIndex(function(s){return s.producaoId===prodId;});
  if (idx>=0) {
    if (!confirm('Já existe folha para este evento. Substituir?')) return;
    D.separacoes[idx] = sep;
  } else {
    D.separacoes.push(sep);
  }
  sv('separacoes');
  alert('Folha de separação gerada!');
  setSepView('lista');
}

function abrirSeparacao(id) {
  var s = (D.separacoes||[]).find(function(x){return x.id===id;});
  if (!s) return;
  var cont = document.getElementById('sep-detalhe-body');
  if (!cont) return;

  var html = '<div style="padding:16px">';
  html += '<div style="background:var(--bg3);border-radius:var(--radius);padding:10px 14px;margin-bottom:14px;border:1px solid var(--border)">' +
    '<div style="font-size:15px;font-weight:700">' + (s.evento||'—') + '</div>' +
    '<div style="font-size:12px;color:var(--text3)">' + (s.local||'') + ' · ' + (fd(s.data)||'') + ' · ' + (s.hrInicio||'') + '–' + (s.hrFim||'') + '</div>' +
    '<div style="font-size:12px;color:var(--text3)">' + s.convidados + ' convidados · Equipe: ' + s.totalEquipe + ' · Bartenders: ' + s.bartenders + '</div>' +
  '</div>';

  if (s.itens) {
    Object.entries(s.itens).forEach(function(entry) {
      var cat = entry[0]; var itens = entry[1];
      var linhas = Object.entries(itens).filter(function(e){return e[1]>0;});
      if (!linhas.length) return;
      html += '<div style="margin-bottom:12px">' +
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;padding-bottom:4px;border-bottom:2px solid var(--border2);margin-bottom:6px">' + cat + '</div>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:4px">';
      linhas.forEach(function(e) {
        html += '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid var(--border);font-size:12px">' +
          '<span style="color:var(--text2)">' + e[0] + '</span>' +
          '<span style="font-weight:600;font-family:var(--mono)">' + e[1] + ' UN</span>' +
        '</div>';
      });
      html += '</div></div>';
    });
  }

  if (s.bebidasAlc) {
    html += '<div style="margin-bottom:12px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;padding-bottom:4px;border-bottom:2px solid var(--border2);margin-bottom:6px">BEBIDAS ALCOÓLICAS</div>' +
      '<div style="white-space:pre-wrap;font-size:12px;color:var(--text2)">' + s.bebidasAlc + '</div>' +
    '</div>';
  }

  if (s.coqueteis) {
    html += '<div style="margin-bottom:12px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;padding-bottom:4px;border-bottom:2px solid var(--border2);margin-bottom:6px">COQUETÉIS</div>' +
      '<div style="white-space:pre-wrap;font-size:12px;color:var(--text2)">' + s.coqueteis + '</div>' +
    '</div>';
  }

  html += '</div>';
  cont.innerHTML = html;
  setSepView('detalhe');
}

function imprimirSeparacao(id) {
  var s = (D.separacoes||[]).find(function(x){return x.id===id;});
  if (!s) return;
  var dataFmt = s.data ? s.data.split('-').reverse().join('/') : '—';
  var col = '<colgroup><col style="width:55%"><col style="width:15%"><col style="width:15%"><col style="width:15%"></colgroup>';
  var thead = '<thead><tr><th>Item</th><th>Qtd</th><th>Saída</th><th>Volta</th></tr></thead>';
  var w = window.open('','_blank');
  var body = '';

  if (s.itens) {
    Object.entries(s.itens).forEach(function(entry) {
      var cat = entry[0]; var itens = entry[1];
      var linhas = Object.entries(itens).filter(function(e){return e[1]>0;});
      if (!linhas.length) return;
      body += '<div class="st">' + cat + '</div>' +
        '<table>' + col + thead + '<tbody>' +
        linhas.map(function(e){return '<tr><td>'+e[0]+'</td><td>'+e[1]+' UN</td><td></td><td></td></tr>';}).join('') +
        '</tbody></table>';
    });
  }

  if (s.bebidasAlc) {
    body += '<div class="st">BEBIDAS ALCOÓLICAS</div>' +
      '<table>' + col + thead + '<tbody>' +
      s.bebidasAlc.split('\n').filter(Boolean).map(function(l){return '<tr><td colspan="2">'+l+'</td><td></td><td></td></tr>';}).join('') +
      '</tbody></table>';
  }

  if (s.coqueteis) {
    body += '<div class="st">COQUETÉIS</div><div style="white-space:pre-wrap;font-size:11px;padding:4px 0">' + s.coqueteis + '</div>';
  }

  w.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Separação — '+s.evento+'</title>' +
    '<style>body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#111}h2{font-size:14px;margin:0 0 2px}.sub{font-size:11px;color:#555;margin-bottom:10px}table{width:100%;border-collapse:collapse;margin-bottom:12px;table-layout:fixed}th{background:#111;color:#fff;padding:5px 8px;text-align:left;font-size:10px;text-transform:uppercase}td{padding:4px 8px;border-bottom:1px solid #e0e0e0;word-break:break-word}tr:nth-child(even)td{background:#f9f9f9}.st{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#333;margin:8px 0 4px;border-bottom:1px solid #ccc;padding-bottom:3px}@media print{body{margin:10px}}</style>' +
    '</head><body>' +
    '<h2>FOLHA DE SEPARAÇÃO — ' + (s.evento||'').toUpperCase() + '</h2>' +
    '<div class="sub">Data: ' + dataFmt + ' | Local: ' + (s.local||'—') + ' | Horário: ' + (s.hrInicio||'—') + ' às ' + (s.hrFim||'—') + '<br>' +
    'Convidados: ' + s.convidados + ' | Equipe: ' + s.totalEquipe + ' | Bartenders: ' + s.bartenders + '</div>' +
    body +
    '<div style="margin-top:20px;font-size:10px;color:#888">Quebras no transporte: ___________________________________</div>' +
    '<div style="font-size:10px;color:#888;margin-top:6px">Impresso em: ' + new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR') + '</div>' +
    '<script>window.onload=function(){window.print()};<\/script></body></html>');
  w.document.close();
}

function excluirSeparacao(id) {
  if (!confirm('Excluir esta folha?')) return;
  D.separacoes = (D.separacoes||[]).filter(function(s){return s.id!==id;});
  sv('separacoes'); rSeparacoes();
}
