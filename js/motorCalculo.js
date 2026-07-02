// ─── MOTOR DE CÁLCULO DE ORÇAMENTO ────────────────────────────────────────────
// Módulo novo e independente: NÃO lê nem escreve orc.calcItens/orc.insumos e não
// modifica orcCalc.js/refConsumo.js — só chama funções já existentes desses
// arquivos em modo leitura (_rcMapFichaItemToRC, _calcTipoToGrupoRC, _calcAutoStaff,
// _rcGetStats, _rcSugestao). As abas Calculadora e Cardápio continuam intactas.
//
// Dados de negócio (catálogo de itens, fatores, margem de segurança) vivem em
// D.motorCatalogo / D.motorFatores / D.motorMargemSeguranca (Firestore), editáveis
// pela tela "Regras e Cálculos". As constantes _PADRAO abaixo são só o seed inicial.

// ─── SEEDS (extraídos do Calculos.xlsx original via Excel COM) ───────────────

var MOTOR_LOCAIS = [
  { key:'area_central',       label:'Área Central BH' },
  { key:'jardim_canada',      label:'Jardim Canadá' },
  { key:'reg_metropolitana',  label:'Região Metropolitana' },
  { key:'viagem_60_100',      label:'Viagem 60-100 Km' },
  { key:'viagem_100_200',     label:'Viagem 100-200 Km' },
  { key:'viagem_200_300',     label:'Viagem 200-300 Km' },
  { key:'viagem_300_400',     label:'Viagem 300-400 Km' },
  { key:'viagem_geral',       label:'Viagem (geral)' },
];

// Catálogo REAL extraído do Calculos.xlsx original (379 itens ativos, coluna AF:AK da
// aba 'Cálculo - Opção 1 (2)'), via Excel COM. Preços (precoMedio) são os últimos valores
// em cache na planilha (o link externo para CONTROLE_PREÇOS.xlsx está quebrado) — cabe à
// Juliana revisar/corrigir na tela de admin. Itens com tipoRegra='manual' e
// descricaoRegra preenchida têm uma regra de bolso conhecida que não foi automatizada
// (fórmula original dependia de outras células, ex.: tipo de copo/local) — mantidos
// manuais de propósito em vez de arriscar uma fórmula errada.
var MOTOR_CATALOGO_PADRAO = [{"id":"MI0001","categoria":"Gelo","nome":"Escama","unidade":"20kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"1"},{"ate":null,"formula":"(1+(((convidados-100)/100)*1))"}]},"precoMedio":11,"ativo":true,"descricaoRegra":"Mínimo de 1, acrescenta 1 a cada 100 pessoas"},{"id":"MI0002","categoria":"Gelo","nome":"Cubo","unidade":"5kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":60,"formula":"(convidados/3.2)"},{"ate":150,"formula":"(convidados/5)"},{"ate":300,"formula":"(convidados/6.5)"},{"ate":null,"formula":"(convidados/8)"}]},"precoMedio":7.5,"ativo":true,"descricaoRegra":"Até 60 convidados, 1 a cada 3,3 pessoas; 150, 5; 300, 6,5; 400, 8."},{"id":"MI0003","categoria":"Gelo","nome":"Seco","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":35,"ativo":true,"descricaoRegra":""},{"id":"MI0004","categoria":"Frutas","nome":"Abacaxi","unidade":"uni","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":25,"formula":"2"},{"ate":null,"formula":"(1+(((convidados-25)/25)*1))"}]},"precoMedio":5.45,"ativo":true,"descricaoRegra":"1 a cada 25 pessoas"},{"id":"MI0005","categoria":"Frutas","nome":"Amora","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"2"},{"ate":null,"formula":"(2+(((convidados-100)/100)*1))"}]},"precoMedio":20.39,"ativo":true,"descricaoRegra":"Mínimo de 2; 1 quilo a cada 100 pessoas"},{"id":"MI0006","categoria":"Frutas","nome":"Caju","unidade":"cx","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"2"},{"ate":null,"formula":"(2+(((convidados-100)/100)*2))"}]},"precoMedio":26.92,"ativo":true,"descricaoRegra":"Mínimo de 8 bandejas (2 caixas); acrescenta 1 caixa a cada 100 pessoas"},{"id":"MI0007","categoria":"Frutas","nome":"Cereja","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":19.71,"ativo":true,"descricaoRegra":""},{"id":"MI0008","categoria":"Frutas","nome":"Figo","unidade":"bdj","tipoRegra":"manual","regra":{},"precoMedio":13.33,"ativo":true,"descricaoRegra":""},{"id":"MI0009","categoria":"Frutas","nome":"Grapefruit","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":18.5,"ativo":true,"descricaoRegra":""},{"id":"MI0010","categoria":"Frutas","nome":"Jabuticaba","unidade":"l","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"3"},{"ate":null,"formula":"(3+(((convidados-100)/100)*3))"}]},"precoMedio":5.38,"ativo":true,"descricaoRegra":"Mínimo de 3 litros; acrescenta 3 litros a cada 100 pessoas"},{"id":"MI0011","categoria":"Frutas","nome":"Kiwi","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"2"},{"ate":200,"formula":"6"},{"ate":null,"formula":"(3+(((convidados-100)/100)*2))"}]},"precoMedio":20.74,"ativo":true,"descricaoRegra":"Mínimo de 2 quilos; acrescenta 2 quilos a cada 100 pessoas"},{"id":"MI0012","categoria":"Frutas","nome":"Laranja Bahia","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"1"},{"ate":null,"formula":"(1+(((convidados-100)/100)*1))"}]},"precoMedio":13.77,"ativo":true,"descricaoRegra":"Mínimo de 1 quilos; acrescenta 1 quilo a cada 100 pessoas"},{"id":"MI0013","categoria":"Frutas","nome":"Laranja Nacional","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"1"},{"ate":null,"formula":"(1+(((convidados-100)/100)*1))"}]},"precoMedio":3.88,"ativo":true,"descricaoRegra":"Mínimo de 1 quilos; acrescenta 1 quilo a cada 100 pessoas"},{"id":"MI0014","categoria":"Frutas","nome":"Lichia","unidade":"lata","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"5"},{"ate":200,"formula":"12"},{"ate":null,"formula":"(6+(((convidados-100)/100)*3))"}]},"precoMedio":25.79,"ativo":true,"descricaoRegra":"Mínimo de 3 latas; acrescenta 3 latas a cada 100 pessoas"},{"id":"MI0015","categoria":"Frutas","nome":"Lima","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"3"},{"ate":null,"formula":"(3+(((convidados-100)/100)*2))"}]},"precoMedio":11.41,"ativo":true,"descricaoRegra":"Mínimo de 2 quilos; acrescenta 2 quilos a cada 100 pessoas"},{"id":"MI0016","categoria":"Frutas","nome":"Limão","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"6"},{"ate":null,"formula":"(4+(((convidados-100)/90)*2))"}]},"precoMedio":6.93,"ativo":true,"descricaoRegra":"Mínimo de 2 quilos; acrescenta 2 quilos a cada 90 pessoas"},{"id":"MI0017","categoria":"Frutas","nome":"Limão Capeta","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"4"},{"ate":null,"formula":"(3+(((convidados-100)/100)*2))"}]},"precoMedio":4.73,"ativo":true,"descricaoRegra":"Mínimo de 2 quilos; acrescenta 2 quilos a cada 100 pessoas"},{"id":"MI0018","categoria":"Frutas","nome":"Limão Siciliano","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"3"},{"ate":null,"formula":"(3+(((convidados-100)/100)*2))"}]},"precoMedio":9.1,"ativo":true,"descricaoRegra":"Mínimo de 2 quilos; acrescenta 2 quilos a cada 100 pessoas"},{"id":"MI0019","categoria":"Frutas","nome":"Maçã","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":8.68,"ativo":true,"descricaoRegra":""},{"id":"MI0020","categoria":"Frutas","nome":"Maçã Verde","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":12.43,"ativo":true,"descricaoRegra":""},{"id":"MI0021","categoria":"Frutas","nome":"Manga","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":5.38,"ativo":true,"descricaoRegra":""},{"id":"MI0022","categoria":"Frutas","nome":"Maracujá","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":50,"formula":"2"},{"ate":null,"formula":"(2+(((convidados-50)/50)*2))"}]},"precoMedio":8.27,"ativo":true,"descricaoRegra":"Mínimo de 2 quilos; acrescenta 2 quilos a cada 50 pessoas"},{"id":"MI0023","categoria":"Frutas","nome":"Melancia","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"2"},{"ate":null,"formula":"(2+(((convidados-100)/100)*2))"}]},"precoMedio":1.52,"ativo":true,"descricaoRegra":"Mínimo de 2 quilos; acrescenta 2 quilos a cada 100 pessoas"},{"id":"MI0024","categoria":"Frutas","nome":"Mexerica","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"2"},{"ate":null,"formula":"(2+(((convidados-100)/100)*2))"}]},"precoMedio":8.53,"ativo":true,"descricaoRegra":"Mínimo de 2 quilos; acrescenta 2 quilos a cada 100 pessoas"},{"id":"MI0025","categoria":"Frutas","nome":"Morango","unidade":"cx","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":25,"formula":"4"},{"ate":50,"formula":"7"},{"ate":null,"formula":"(7+(((convidados-50)/100)*4))"}]},"precoMedio":23.86,"ativo":true,"descricaoRegra":"4 bandejas (1 caixa) a cada 20 pessoas"},{"id":"MI0026","categoria":"Frutas","nome":"Pepino","unidade":"bdj","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"3"},{"ate":null,"formula":"(3+(((convidados-100)/70)*1))"}]},"precoMedio":3.94,"ativo":true,"descricaoRegra":"Mínimo de 3 bandejas; acrescenta 1 bandeja a cada 70 pessoas"},{"id":"MI0027","categoria":"Frutas","nome":"Pera","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":14.27,"ativo":true,"descricaoRegra":""},{"id":"MI0028","categoria":"Frutas","nome":"Romã","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":36.57,"ativo":true,"descricaoRegra":""},{"id":"MI0029","categoria":"Frutas","nome":"Seriguela","unidade":"cx","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"2"},{"ate":null,"formula":"(2+(((convidados-100)/100)*2))"}]},"precoMedio":20.5,"ativo":true,"descricaoRegra":"Mínimo de 8 bandejas (2 caixas); acrescenta 1 caixa a cada 100 pessoas"},{"id":"MI0030","categoria":"Frutas","nome":"Uva Verde","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100))"}]},"precoMedio":10.69,"ativo":true,"descricaoRegra":"1 KG a cada 100 convidados"},{"id":"MI0031","categoria":"Frutas","nome":"Uva Vermelha","unidade":"kg","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":100,"formula":"5"},{"ate":null,"formula":"(5+(((convidados-100)/100)*1))"}]},"precoMedio":10.97,"ativo":true,"descricaoRegra":"Mínimo de 5; acrescenta 1 quilo a cada 100 pessoas"},{"id":"MI0032","categoria":"Copos","nome":"Aperitivo America","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0033","categoria":"Copos","nome":"Aperitivo Diony","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100)*9)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":"9 dúzias a cada 100 pessoas"},{"id":"MI0034","categoria":"Copos","nome":"Caneca de cobre","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100)*8)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":"8 dúzias a cada 100 pessoas"},{"id":"MI0035","categoria":"Copos","nome":"Coupe America","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100)*3)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":"3 dúzias a cada 100 pessoas"},{"id":"MI0036","categoria":"Copos","nome":"Coupe Imperial","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100)*4)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":"4 dúzias a cada 100 pessoas"},{"id":"MI0037","categoria":"Copos","nome":"Coupe Multicristal","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":150,"formula":"(convidados*2/12)"},{"ate":null,"formula":"(convidados*1.6/12)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0038","categoria":"Copos","nome":"Dubai","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0039","categoria":"Copos","nome":"Flute Imperial","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0040","categoria":"Copos","nome":"Flute Multicristal","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0041","categoria":"Copos","nome":"Gin Brunello","unidade":"15UND","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100)*8)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":"8 dúzias a cada 100 pessoas"},{"id":"MI0042","categoria":"Copos","nome":"Gin Multicristal","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0043","categoria":"Copos","nome":"Gin Xtar","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0044","categoria":"Copos","nome":"Long Amassadinho","unidade":"15UND","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0045","categoria":"Copos","nome":"Longo Diony","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":150,"formula":"(convidados*2/12)"},{"ate":null,"formula":"(convidados*1.6/12)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0046","categoria":"Copos","nome":"Longo Elysia","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":150,"formula":"(convidados*2/12)"},{"ate":null,"formula":"(convidados*1.6/12)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0047","categoria":"Copos","nome":"longo Liso","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100)*2)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":"2 dúzias a cada 100 pessoas"},{"id":"MI0048","categoria":"Copos","nome":"Longo Revel","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100)*2)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":"2 dúzias a cada 100 pessoas"},{"id":"MI0049","categoria":"Copos","nome":"Longo Xtar","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0050","categoria":"Copos","nome":"Margarita","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100)*2)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":"2 dúzias a cada 100 pessoas"},{"id":"MI0051","categoria":"Copos","nome":"Martini","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":"9 dúzias a cada 100 pessoas"},{"id":"MI0052","categoria":"Copos","nome":"Martini America","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":"9 dúzias a cada 100 pessoas"},{"id":"MI0053","categoria":"Copos","nome":"Vinho Suprema","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100)*2)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":"2 dúzias a cada 100 pessoas"},{"id":"MI0054","categoria":"Copos","nome":"Whisky Diony","unidade":"dz","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"((convidados/100)*2)"}]},"precoMedio":30,"ativo":true,"descricaoRegra":"2 dúzias a cada 100 pessoas"},{"id":"MI0055","categoria":"Copos","nome":"Whisky Elysia","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0056","categoria":"Copos","nome":"Whisky Imperial","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0057","categoria":"Copos","nome":"Whisky Liso","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0058","categoria":"Copos","nome":"Whisky Revel","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0059","categoria":"Copos","nome":"Whisky Xtar","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0060","categoria":"Copos","nome":"Whiky Ceramica","unidade":"dz","tipoRegra":"manual","regra":{},"precoMedio":40,"ativo":true,"descricaoRegra":""},{"id":"MI0061","categoria":"Copos","nome":"Condimentos","unidade":"0","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0062","categoria":"Copos","nome":"Padrão","unidade":"uni","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"convidados"}]},"precoMedio":1.04,"ativo":true,"descricaoRegra":"1 por pessoa"},{"id":"MI0063","categoria":"Copos","nome":"Simples","unidade":"uni","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"convidados"}]},"precoMedio":0.63,"ativo":true,"descricaoRegra":"1 por pessoa"},{"id":"MI0064","categoria":"Copos","nome":"Descartáveis","unidade":"0","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0065","categoria":"Copos","nome":"Padrão","unidade":"uni","tipoRegra":"patamar","regra":{"modo":"faixas","faixas":[{"ate":null,"formula":"convidados"}]},"precoMedio":0.64,"ativo":true,"descricaoRegra":"1 por pessoa"},{"id":"MI0066","categoria":"Vodka","nome":"Absolut","unidade":"1000ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Vodka"},"precoMedio":90,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0067","categoria":"Vodka","nome":"Belvedere","unidade":"700 ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Vodka"},"precoMedio":197.9,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0068","categoria":"Vodka","nome":"Ciroc","unidade":"750 ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Vodka"},"precoMedio":174.9,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0069","categoria":"Vodka","nome":"Grey Goose","unidade":"750 ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Vodka"},"precoMedio":175,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0070","categoria":"Vodka","nome":"Ketel One","unidade":"1L","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Vodka"},"precoMedio":75,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0071","categoria":"Vodka","nome":"Smirnoff","unidade":"998ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Vodka"},"precoMedio":37.9,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0072","categoria":"Vodka","nome":"Stolichnaya","unidade":"1L","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Vodka"},"precoMedio":130,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0073","categoria":"Vodka","nome":"Wyborowa","unidade":"1L","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Vodka"},"precoMedio":60,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0074","categoria":"Bitter","nome":"Aperol","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Aperol"},"precoMedio":55,"ativo":true,"descricaoRegra":""},{"id":"MI0075","categoria":"Bitter","nome":"Campari","unidade":"998ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Campari"},"precoMedio":58.6,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0076","categoria":"Bitter","nome":"Fernet Branca","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Fernet"},"precoMedio":165,"ativo":true,"descricaoRegra":""},{"id":"MI0077","categoria":"Bitter","nome":"Martini Bitter","unidade":"995 ml","tipoRegra":"manual","regra":{},"precoMedio":43.25,"ativo":true,"descricaoRegra":""},{"id":"MI0078","categoria":"Bourbon","nome":"Bufallo Trace","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Whisky"},"precoMedio":210,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0079","categoria":"Bourbon","nome":"Bulleit Bourbon","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Whisky"},"precoMedio":240,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0080","categoria":"Bourbon","nome":"Jack Daniels","unidade":"1000ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Whisky"},"precoMedio":140,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0081","categoria":"Bourbon","nome":"Jameson","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Whisky"},"precoMedio":99.9,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0082","categoria":"Cachaça","nome":"Salinas","unidade":"600ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Cachaça"},"precoMedio":20.5,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0083","categoria":"Cachaça","nome":"Vale Verde","unidade":"1L","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Cachaça"},"precoMedio":69,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0084","categoria":"Cachaça","nome":"Germana","unidade":"1L","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Cachaça"},"precoMedio":58.75,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0085","categoria":"Cachaça","nome":"Seleta","unidade":"1l","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Cachaça"},"precoMedio":45,"ativo":true,"descricaoRegra":""},{"id":"MI0086","categoria":"Cachaça","nome":"Spiral","unidade":"1L","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Cachaça"},"precoMedio":45,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0087","categoria":"Espumante","nome":"Le Blanc","unidade":"660ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Espumante"},"precoMedio":41.97,"ativo":true,"descricaoRegra":"1 garrafa a cada 2 convidados"},{"id":"MI0088","categoria":"Espumante","nome":"Manza","unidade":"350ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Espumante"},"precoMedio":10,"ativo":true,"descricaoRegra":"1 garrafa a cada 2 convidados"},{"id":"MI0089","categoria":"Espumante","nome":"Alud","unidade":"750 ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Espumante"},"precoMedio":45,"ativo":true,"descricaoRegra":"1 garrafa a cada 2 convidados"},{"id":"MI0090","categoria":"Gim","nome":"Beefeater","unidade":"750 ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Gim"},"precoMedio":90,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0091","categoria":"Gim","nome":"Bombay Sapphire","unidade":"750 ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Gim"},"precoMedio":105.82,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0092","categoria":"Gim","nome":"Tanqueray","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Gim"},"precoMedio":127.5,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0093","categoria":"Gim","nome":"Hendricks","unidade":"750 ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Gim"},"precoMedio":189.9,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0094","categoria":"Gim","nome":"Velvo","unidade":"700ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Gim"},"precoMedio":73.49,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0095","categoria":"Gim","nome":"Yvy","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Gim"},"precoMedio":75.19,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0096","categoria":"Gim","nome":"Martin Miller","unidade":"700ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Gim"},"precoMedio":180,"ativo":true,"descricaoRegra":"Estimativa de consumo baseada no histórico"},{"id":"MI0097","categoria":"Rum","nome":"Bacardi","unidade":"980 ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Rum"},"precoMedio":37.26,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0098","categoria":"Rum","nome":"Bacardi Black","unidade":"0","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Rum"},"precoMedio":85.6,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0099","categoria":"Rum","nome":"Havana 3 Anos","unidade":"750 ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Rum"},"precoMedio":82.84,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0100","categoria":"Rum","nome":"Montilla","unidade":"l","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Rum"},"precoMedio":21.2,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0101","categoria":"Sake","nome":"Azuma Kirin Dourado","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Sake"},"precoMedio":41.33,"ativo":true,"descricaoRegra":"1 garrafa a cada 55 convidados"},{"id":"MI0102","categoria":"Sake","nome":"Azuma Kirin Soft","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Sake"},"precoMedio":37.42,"ativo":true,"descricaoRegra":"1 garrafa a cada 55 convidados"},{"id":"MI0103","categoria":"Tequila","nome":"José Cuervo Especial","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Tequila"},"precoMedio":142.9,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0104","categoria":"Tequila","nome":"José Cuervo Tradicional","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Tequila"},"precoMedio":206.9,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0105","categoria":"Tequila","nome":"1800 Anejo","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Tequila"},"precoMedio":345,"ativo":true,"descricaoRegra":"1 garrafa a cada 70 convidados"},{"id":"MI0106","categoria":"Tequila","nome":"1800 Blanco","unidade":"750ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Tequila"},"precoMedio":259.9,"ativo":true,"descricaoRegra":""},{"id":"MI0107","categoria":"Tequila","nome":"1800 Cristalino","unidade":"700ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Tequila"},"precoMedio":429.9,"ativo":true,"descricaoRegra":"1 garrafa a cada 5 convidados"},{"id":"MI0108","categoria":"Tequila","nome":"1800 Milenio","unidade":"700ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Tequila"},"precoMedio":1629,"ativo":true,"descricaoRegra":""},{"id":"MI0109","categoria":"Tequila","nome":"Maestro Dobel","unidade":"700ml","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Tequila"},"precoMedio":429.9,"ativo":true,"descricaoRegra":""},{"id":"MI0110","categoria":"Licor","nome":"Absinto","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0111","categoria":"Licor","nome":"Amaretto","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0112","categoria":"Licor","nome":"Amaroguta","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0113","categoria":"Licor","nome":"Amarula","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0114","categoria":"Licor","nome":"Baileys","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0115","categoria":"Licor","nome":"Banana","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":129.9,"ativo":true,"descricaoRegra":""},{"id":"MI0116","categoria":"Licor","nome":"Balena Morango","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":129.9,"ativo":true,"descricaoRegra":""},{"id":"MI0117","categoria":"Licor","nome":"Balena Coco","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":129.9,"ativo":true,"descricaoRegra":""},{"id":"MI0118","categoria":"Licor","nome":"Balena Chocolate","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":129.9,"ativo":true,"descricaoRegra":""},{"id":"MI0119","categoria":"Licor","nome":"Cacao","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":39,"ativo":true,"descricaoRegra":""},{"id":"MI0120","categoria":"Licor","nome":"Café","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":39,"ativo":true,"descricaoRegra":""},{"id":"MI0121","categoria":"Licor","nome":"Campari","unidade":"garrafa","tipoRegra":"faixaDestilado","regra":{"rcNomeOverride":"Campari"},"precoMedio":55.71,"ativo":true,"descricaoRegra":""},{"id":"MI0122","categoria":"Licor","nome":"Cassis","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":39,"ativo":true,"descricaoRegra":""},{"id":"MI0123","categoria":"Licor","nome":"Catuaba","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":14,"ativo":true,"descricaoRegra":""},{"id":"MI0124","categoria":"Licor","nome":"Cedilla","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":78,"ativo":true,"descricaoRegra":""},{"id":"MI0125","categoria":"Licor","nome":"Chocolate","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":39,"ativo":true,"descricaoRegra":""},{"id":"MI0126","categoria":"Licor","nome":"Coconut","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":39,"ativo":true,"descricaoRegra":""},{"id":"MI0127","categoria":"Licor","nome":"Cointreau","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":135.71,"ativo":true,"descricaoRegra":""},{"id":"MI0128","categoria":"Licor","nome":"Curaçau Blue","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":39,"ativo":true,"descricaoRegra":""},{"id":"MI0129","categoria":"Licor","nome":"FireBall Cinammon","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":109.9,"ativo":true,"descricaoRegra":""},{"id":"MI0130","categoria":"Licor","nome":"Frangélico","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":127,"ativo":true,"descricaoRegra":""},{"id":"MI0131","categoria":"Licor","nome":"Grand Marnier","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":198,"ativo":true,"descricaoRegra":""},{"id":"MI0132","categoria":"Licor","nome":"Jagermeister","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":154.99,"ativo":true,"descricaoRegra":""},{"id":"MI0133","categoria":"Licor","nome":"Licor 43 Tradicional","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":169.9,"ativo":true,"descricaoRegra":""},{"id":"MI0134","categoria":"Licor","nome":"Licor 43 Chocolate","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":229.9,"ativo":true,"descricaoRegra":""},{"id":"MI0135","categoria":"Licor","nome":"Licor 43 Creme Brulle","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":240,"ativo":true,"descricaoRegra":""},{"id":"MI0136","categoria":"Licor","nome":"Amaretto Vila Massa","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":175,"ativo":true,"descricaoRegra":""},{"id":"MI0137","categoria":"Licor","nome":"Licor Anaue","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":99.9,"ativo":true,"descricaoRegra":""},{"id":"MI0138","categoria":"Licor","nome":"Lillet","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":94.9,"ativo":true,"descricaoRegra":""},{"id":"MI0139","categoria":"Licor","nome":"Lillet Rose","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":89.9,"ativo":true,"descricaoRegra":""},{"id":"MI0140","categoria":"Licor","nome":"Limoncello Vila Massa","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":204.9,"ativo":true,"descricaoRegra":""},{"id":"MI0141","categoria":"Licor","nome":"Malibu","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":49,"ativo":true,"descricaoRegra":""},{"id":"MI0142","categoria":"Licor","nome":"Maraschino","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":130,"ativo":true,"descricaoRegra":""},{"id":"MI0143","categoria":"Licor","nome":"Menta","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":39,"ativo":true,"descricaoRegra":""},{"id":"MI0144","categoria":"Licor","nome":"Midori","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":123,"ativo":true,"descricaoRegra":""},{"id":"MI0145","categoria":"Licor","nome":"PeachTree","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":196.9,"ativo":true,"descricaoRegra":""},{"id":"MI0146","categoria":"Licor","nome":"Ramazotti Amaro","unidade":"700ml","tipoRegra":"manual","regra":{},"precoMedio":89.9,"ativo":true,"descricaoRegra":""},{"id":"MI0147","categoria":"Licor","nome":"Sambuca","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":99,"ativo":true,"descricaoRegra":""},{"id":"MI0148","categoria":"Licor","nome":"St Germain","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":180,"ativo":true,"descricaoRegra":""},{"id":"MI0149","categoria":"Licor","nome":"Triple Sec","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":56.49,"ativo":true,"descricaoRegra":""},{"id":"MI0150","categoria":"Licor","nome":"Vermute Antica Formula","unidade":"1000ml","tipoRegra":"manual","regra":{},"precoMedio":500,"ativo":true,"descricaoRegra":""},{"id":"MI0151","categoria":"Licor","nome":"Vermute Bianco Carpano","unidade":"950ml","tipoRegra":"manual","regra":{},"precoMedio":129.9,"ativo":true,"descricaoRegra":""},{"id":"MI0152","categoria":"Licor","nome":"Vermute Bianco Martini","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":43.9,"ativo":true,"descricaoRegra":""},{"id":"MI0153","categoria":"Licor","nome":"Vermute Dry Martini","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":47.9,"ativo":true,"descricaoRegra":""},{"id":"MI0154","categoria":"Licor","nome":"Vermute Rosso Carpano","unidade":"950ml","tipoRegra":"manual","regra":{},"precoMedio":114.9,"ativo":true,"descricaoRegra":""},{"id":"MI0155","categoria":"Licor","nome":"Vermute Rosso Cinzano","unidade":"garrafa","tipoRegra":"manual","regra":{},"precoMedio":36.75,"ativo":true,"descricaoRegra":""},{"id":"MI0156","categoria":"Licor","nome":"Vermute Rosso Martini","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":49.9,"ativo":true,"descricaoRegra":""},{"id":"MI0157","categoria":"Licor","nome":"Vermute Rosso Punt e Mês","unidade":"750ml","tipoRegra":"manual","regra":{},"precoMedio":129.9,"ativo":true,"descricaoRegra":""},{"id":"MI0158","categoria":"Xarope","nome":"Amora","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0159","categoria":"Xarope","nome":"Amendoa","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0160","categoria":"Xarope","nome":"Banana","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0161","categoria":"Xarope","nome":"Baunilha","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0162","categoria":"Xarope","nome":"Baunilha Francesa","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0163","categoria":"Xarope","nome":"Blood Orange","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0164","categoria":"Xarope","nome":"Blue Curaçau","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0165","categoria":"Xarope","nome":"Caramelo","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0166","categoria":"Xarope","nome":"Cereja","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0167","categoria":"Xarope","nome":"Chocolate","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0168","categoria":"Xarope","nome":"Cranberry","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0169","categoria":"Xarope","nome":"Coco","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0170","categoria":"Xarope","nome":"Doce de leite","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0171","categoria":"Xarope","nome":"Elderflower","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0172","categoria":"Xarope","nome":"Framboesa","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0173","categoria":"Xarope","nome":"Grapefruit","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0174","categoria":"Xarope","nome":"Grenadine","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0175","categoria":"Xarope","nome":"Groselha","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0176","categoria":"Xarope","nome":"Hibisco","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0177","categoria":"Xarope","nome":"Irish Cream","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0178","categoria":"Xarope","nome":"Kiwi","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0179","categoria":"Xarope","nome":"Lichia","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0180","categoria":"Xarope","nome":"Maçã Verde","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0181","categoria":"Xarope","nome":"Mandarin","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0182","categoria":"Xarope","nome":"Manjericão","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0183","categoria":"Xarope","nome":"Maple","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0184","categoria":"Xarope","nome":"Maracujá Vermelho","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0185","categoria":"Xarope","nome":"Marshmallow","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0186","categoria":"Xarope","nome":"Melancia","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0187","categoria":"Xarope","nome":"Melão","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0188","categoria":"Xarope","nome":"Mint","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0189","categoria":"Xarope","nome":"Mirtilo","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0190","categoria":"Xarope","nome":"Mojito","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0191","categoria":"Xarope","nome":"Morango","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0192","categoria":"Xarope","nome":"Orgeat","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0193","categoria":"Xarope","nome":"Orquídia","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0194","categoria":"Xarope","nome":"Pepino","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0195","categoria":"Xarope","nome":"Romã","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0196","categoria":"Xarope","nome":"Rosas","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0197","categoria":"Xarope","nome":"Spicy","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0198","categoria":"Xarope","nome":"Spicy Mango","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0199","categoria":"Xarope","nome":"Tiramissu","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0200","categoria":"Xarope","nome":"Violeta","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0201","categoria":"Xarope","nome":"Yuzu","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":75,"ativo":true,"descricaoRegra":""},{"id":"MI0202","categoria":"Suco","nome":"Abacaxi","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":""},{"id":"MI0203","categoria":"Suco","nome":"Acerola","unidade":"pacote","tipoRegra":"manual","regra":{},"precoMedio":2.4,"ativo":true,"descricaoRegra":""},{"id":"MI0204","categoria":"Suco","nome":"Banana","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":5.05,"ativo":true,"descricaoRegra":""},{"id":"MI0205","categoria":"Suco","nome":"Caju","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":""},{"id":"MI0206","categoria":"Suco","nome":"Chá Verde","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":6.1,"ativo":true,"descricaoRegra":""},{"id":"MI0207","categoria":"Suco","nome":"Cranberry","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":6.63,"ativo":true,"descricaoRegra":""},{"id":"MI0208","categoria":"Suco","nome":"Goiaba","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":""},{"id":"MI0209","categoria":"Suco","nome":"Grapefruit","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":12,"ativo":true,"descricaoRegra":""},{"id":"MI0210","categoria":"Suco","nome":"Graviola","unidade":"pacote","tipoRegra":"manual","regra":{},"precoMedio":2.4,"ativo":true,"descricaoRegra":""},{"id":"MI0211","categoria":"Suco","nome":"Laranja","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":""},{"id":"MI0212","categoria":"Suco","nome":"Lichia","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":11.8,"ativo":true,"descricaoRegra":""},{"id":"MI0213","categoria":"Suco","nome":"Limonada","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":5.8,"ativo":true,"descricaoRegra":""},{"id":"MI0214","categoria":"Suco","nome":"Maçã","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":""},{"id":"MI0215","categoria":"Suco","nome":"Maçã Integral","unidade":"1,5L","tipoRegra":"manual","regra":{},"precoMedio":15,"ativo":true,"descricaoRegra":""},{"id":"MI0216","categoria":"Suco","nome":"Manga","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":""},{"id":"MI0217","categoria":"Suco","nome":"Maracujá","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":""},{"id":"MI0218","categoria":"Suco","nome":"Matcha","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":12,"ativo":true,"descricaoRegra":""},{"id":"MI0219","categoria":"Suco","nome":"Pera","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":""},{"id":"MI0220","categoria":"Suco","nome":"Pêssego","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":""},{"id":"MI0221","categoria":"Suco","nome":"Pitanga","unidade":"pacote","tipoRegra":"manual","regra":{},"precoMedio":2.4,"ativo":true,"descricaoRegra":""},{"id":"MI0222","categoria":"Suco","nome":"Romã","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":6.53,"ativo":true,"descricaoRegra":"12 garrafas a cada 100 pessoas"},{"id":"MI0223","categoria":"Suco","nome":"Tamarindo","unidade":"pacote","tipoRegra":"manual","regra":{},"precoMedio":2.4,"ativo":true,"descricaoRegra":"2 garrafas a cada 100 pessoas"},{"id":"MI0224","categoria":"Suco","nome":"Tangerina","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":"1 lata a cada 3 convidados"},{"id":"MI0225","categoria":"Suco","nome":"Tomate","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":13.25,"ativo":true,"descricaoRegra":""},{"id":"MI0226","categoria":"Suco","nome":"Uva","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":4.25,"ativo":true,"descricaoRegra":""},{"id":"MI0227","categoria":"Suco","nome":"Uva Integral","unidade":"1,5L","tipoRegra":"manual","regra":{},"precoMedio":12,"ativo":true,"descricaoRegra":""},{"id":"MI0228","categoria":"Suco","nome":"Natural Abacaxi Hort","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":16,"ativo":true,"descricaoRegra":"2 garrafas a cada 100 pessoas"},{"id":"MI0229","categoria":"Suco","nome":"Natural Budapest Lem","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":16,"ativo":true,"descricaoRegra":"0,5 lata por pessoa"},{"id":"MI0230","categoria":"Suco","nome":"Natural F. Amarelas","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":16,"ativo":true,"descricaoRegra":"2 garrafas a cada 100 pessoas"},{"id":"MI0231","categoria":"Suco","nome":"Natural F. Vermelhas","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":16,"ativo":true,"descricaoRegra":"Uma unidade por convidado"},{"id":"MI0232","categoria":"Suco","nome":"Natural Laranja","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":16,"ativo":true,"descricaoRegra":""},{"id":"MI0233","categoria":"Suco","nome":"Natural Limão","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":16,"ativo":true,"descricaoRegra":""},{"id":"MI0234","categoria":"Suco","nome":"Natural Pink Lemon","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":16,"ativo":true,"descricaoRegra":""},{"id":"MI0235","categoria":"Suco","nome":"Natural Verde","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":16.67,"ativo":true,"descricaoRegra":""},{"id":"MI0236","categoria":"Refrigerantes E Complementos","nome":"Água De Coco","unidade":"l","tipoRegra":"manual","regra":{},"precoMedio":6.87,"ativo":true,"descricaoRegra":""},{"id":"MI0237","categoria":"Refrigerantes E Complementos","nome":"Água Gasosa","unidade":"500 ml","tipoRegra":"manual","regra":{},"precoMedio":1.74,"ativo":true,"descricaoRegra":"Um litro a cada 44 convidados"},{"id":"MI0238","categoria":"Refrigerantes E Complementos","nome":"Água Mineral","unidade":"1,5 l","tipoRegra":"manual","regra":{},"precoMedio":1.81,"ativo":true,"descricaoRegra":"Um litro a cada 22 convidados"},{"id":"MI0239","categoria":"Refrigerantes E Complementos","nome":"Água Tônica","unidade":"350 ml","tipoRegra":"manual","regra":{},"precoMedio":2.6,"ativo":true,"descricaoRegra":"Um litro a cada 44 convidados"},{"id":"MI0240","categoria":"Refrigerantes E Complementos","nome":"Club Soda","unidade":"350 ml","tipoRegra":"manual","regra":{},"precoMedio":3,"ativo":true,"descricaoRegra":"Um litro a cada 44 convidados"},{"id":"MI0241","categoria":"Refrigerantes E Complementos","nome":"Coca Cola","unidade":"2l","tipoRegra":"manual","regra":{},"precoMedio":6.64,"ativo":true,"descricaoRegra":"Um litro a cada 44 convidados"},{"id":"MI0242","categoria":"Refrigerantes E Complementos","nome":"Fanta","unidade":"2l","tipoRegra":"manual","regra":{},"precoMedio":5.7,"ativo":true,"descricaoRegra":""},{"id":"MI0243","categoria":"Refrigerantes E Complementos","nome":"Guaraná","unidade":"2l","tipoRegra":"manual","regra":{},"precoMedio":5.7,"ativo":true,"descricaoRegra":""},{"id":"MI0244","categoria":"Refrigerantes E Complementos","nome":"Red Bull","unidade":"280 ml","tipoRegra":"manual","regra":{},"precoMedio":6.52,"ativo":true,"descricaoRegra":""},{"id":"MI0245","categoria":"Refrigerantes E Complementos","nome":"Soda","unidade":"2 l","tipoRegra":"manual","regra":{},"precoMedio":6.47,"ativo":true,"descricaoRegra":"Um litro a cada 40 convidados"},{"id":"MI0246","categoria":"Refrigerantes E Complementos","nome":"À Vontade","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":2.5,"ativo":true,"descricaoRegra":"Um litro a cada 40 convidados"},{"id":"MI0247","categoria":"Mixes Artesanais","nome":"Chá Camomila","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":9,"ativo":true,"descricaoRegra":"Um litro a cada 30 convidados"},{"id":"MI0248","categoria":"Mixes Artesanais","nome":"Chá Hibisco","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":10.5,"ativo":true,"descricaoRegra":"Um litro a cada 30 convidados"},{"id":"MI0249","categoria":"Mixes Artesanais","nome":"Chá Lavanda","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":9.5,"ativo":true,"descricaoRegra":"Um litro a cada 13 convidados"},{"id":"MI0250","categoria":"Mixes Artesanais","nome":"Chá Mate","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":8.75,"ativo":true,"descricaoRegra":"Um litro a cada 10 convidados"},{"id":"MI0251","categoria":"Mixes Artesanais","nome":"Chá Preto","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":9,"ativo":true,"descricaoRegra":""},{"id":"MI0252","categoria":"Mixes Artesanais","nome":"Espuma Baunilha","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":31.67,"ativo":true,"descricaoRegra":""},{"id":"MI0253","categoria":"Mixes Artesanais","nome":"Espuma Gengibre","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":35,"ativo":true,"descricaoRegra":""},{"id":"MI0254","categoria":"Mixes Artesanais","nome":"Espuma Lichia","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":35.83,"ativo":true,"descricaoRegra":""},{"id":"MI0255","categoria":"Mixes Artesanais","nome":"Espuma Siciliano","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":35.5,"ativo":true,"descricaoRegra":""},{"id":"MI0256","categoria":"Mixes Artesanais","nome":"Espuma Citrica","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":24.33,"ativo":true,"descricaoRegra":"Um litro a cada 10 convidados"},{"id":"MI0257","categoria":"Mixes Artesanais","nome":"Espuma Complexa","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":45,"ativo":true,"descricaoRegra":""},{"id":"MI0258","categoria":"Mixes Artesanais","nome":"Espuma de Jabuticaba","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":45,"ativo":true,"descricaoRegra":""},{"id":"MI0259","categoria":"Mixes Artesanais","nome":"Espuma Simples","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":35,"ativo":true,"descricaoRegra":""},{"id":"MI0260","categoria":"Mixes Artesanais","nome":"Ginger Ale","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":15.5,"ativo":true,"descricaoRegra":""},{"id":"MI0261","categoria":"Mixes Artesanais","nome":"Half and Half","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":15,"ativo":true,"descricaoRegra":""},{"id":"MI0262","categoria":"Mixes Artesanais","nome":"Margarita Mix","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":15,"ativo":true,"descricaoRegra":""},{"id":"MI0263","categoria":"Mixes Artesanais","nome":"Pina Colada Mix","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":15,"ativo":true,"descricaoRegra":""},{"id":"MI0264","categoria":"Mixes Artesanais","nome":"Purê de Morango","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":20,"ativo":true,"descricaoRegra":""},{"id":"MI0265","categoria":"Mixes Artesanais","nome":"Purê Frutas Vermelhas","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":25,"ativo":true,"descricaoRegra":""},{"id":"MI0266","categoria":"Mixes Artesanais","nome":"Siciliano Mix","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":10,"ativo":true,"descricaoRegra":""},{"id":"MI0267","categoria":"Mixes Artesanais","nome":"Simple Syrup","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":5,"ativo":true,"descricaoRegra":""},{"id":"MI0268","categoria":"Mixes Artesanais","nome":"Soda de Grapefruit","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":15.5,"ativo":true,"descricaoRegra":""},{"id":"MI0269","categoria":"Mixes Artesanais","nome":"Sour Mix","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":8,"ativo":true,"descricaoRegra":""},{"id":"MI0270","categoria":"Mixes Artesanais","nome":"Xarope Alecrim","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":12,"ativo":true,"descricaoRegra":""},{"id":"MI0271","categoria":"Mixes Artesanais","nome":"Xarope Canela","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":12,"ativo":true,"descricaoRegra":""},{"id":"MI0272","categoria":"Mixes Artesanais","nome":"Xarope Capim Limão","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":12,"ativo":true,"descricaoRegra":""},{"id":"MI0273","categoria":"Mixes Artesanais","nome":"Xarope Cravo","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":12,"ativo":true,"descricaoRegra":""},{"id":"MI0274","categoria":"Mixes Artesanais","nome":"Xarope Funcho","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":12,"ativo":true,"descricaoRegra":""},{"id":"MI0275","categoria":"Mixes Artesanais","nome":"Xarope Mel","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":8,"ativo":true,"descricaoRegra":""},{"id":"MI0276","categoria":"Mixes Artesanais","nome":"Xarope Mulled Spice","unidade":"1L","tipoRegra":"manual","regra":{},"precoMedio":10,"ativo":true,"descricaoRegra":""},{"id":"MI0277","categoria":"Mixes Artesanais","nome":"Especiarias","unidade":"0","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0278","categoria":"Mixes Artesanais","nome":"Abacaxi Desidratado","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":250,"ativo":true,"descricaoRegra":""},{"id":"MI0279","categoria":"Mixes Artesanais","nome":"Açúcar Cubo","unidade":"pote","tipoRegra":"manual","regra":{},"precoMedio":40.8,"ativo":true,"descricaoRegra":""},{"id":"MI0280","categoria":"Mixes Artesanais","nome":"Açúcar Mascavo","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":12.6,"ativo":true,"descricaoRegra":""},{"id":"MI0281","categoria":"Mixes Artesanais","nome":"Alecrim","unidade":"molho","tipoRegra":"manual","regra":{},"precoMedio":8.2,"ativo":true,"descricaoRegra":""},{"id":"MI0282","categoria":"Mixes Artesanais","nome":"Anis","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":80,"ativo":true,"descricaoRegra":""},{"id":"MI0283","categoria":"Mixes Artesanais","nome":"Avelã","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0284","categoria":"Mixes Artesanais","nome":"Bitter Angostura","unidade":"200ml","tipoRegra":"manual","regra":{},"precoMedio":148.5,"ativo":true,"descricaoRegra":""},{"id":"MI0285","categoria":"Mixes Artesanais","nome":"Bitter Angostura Orange","unidade":"200ml","tipoRegra":"manual","regra":{},"precoMedio":154.8,"ativo":true,"descricaoRegra":""},{"id":"MI0286","categoria":"Mixes Artesanais","nome":"Bitter Chocolate","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":35,"ativo":true,"descricaoRegra":""},{"id":"MI0287","categoria":"Mixes Artesanais","nome":"Bitter Lavanda","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":35,"ativo":true,"descricaoRegra":""},{"id":"MI0288","categoria":"Mixes Artesanais","nome":"Bitter Nib","unidade":"150ml","tipoRegra":"manual","regra":{},"precoMedio":99.9,"ativo":true,"descricaoRegra":"1 a cada 80 pessoas"},{"id":"MI0289","categoria":"Mixes Artesanais","nome":"Bitter Nib Chocolate","unidade":"100ml","tipoRegra":"manual","regra":{},"precoMedio":89.9,"ativo":true,"descricaoRegra":""},{"id":"MI0290","categoria":"Mixes Artesanais","nome":"Bitter Nib Laranja","unidade":"100ml","tipoRegra":"manual","regra":{},"precoMedio":89.9,"ativo":true,"descricaoRegra":""},{"id":"MI0291","categoria":"Mixes Artesanais","nome":"Bitter Orange","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":35,"ativo":true,"descricaoRegra":""},{"id":"MI0292","categoria":"Mixes Artesanais","nome":"Bitter Peychauds","unidade":"148ml","tipoRegra":"manual","regra":{},"precoMedio":149.9,"ativo":true,"descricaoRegra":""},{"id":"MI0293","categoria":"Mixes Artesanais","nome":"Bitter Regans Laranja","unidade":"148ml","tipoRegra":"manual","regra":{},"precoMedio":149.9,"ativo":true,"descricaoRegra":""},{"id":"MI0294","categoria":"Mixes Artesanais","nome":"Canela","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":90,"ativo":true,"descricaoRegra":""},{"id":"MI0295","categoria":"Mixes Artesanais","nome":"Cardamomo","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":1000,"ativo":true,"descricaoRegra":"1 a cada 70 pessoas"},{"id":"MI0296","categoria":"Mixes Artesanais","nome":"Castanha de Caju","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0297","categoria":"Mixes Artesanais","nome":"Cereja em calda","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":80,"ativo":true,"descricaoRegra":""},{"id":"MI0298","categoria":"Mixes Artesanais","nome":"Chantilly","unidade":"lata","tipoRegra":"manual","regra":{},"precoMedio":27.78,"ativo":true,"descricaoRegra":""},{"id":"MI0299","categoria":"Mixes Artesanais","nome":"Clara Em Pó","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":60,"ativo":true,"descricaoRegra":""},{"id":"MI0300","categoria":"Mixes Artesanais","nome":"Clara Pasteurizada","unidade":"500ml","tipoRegra":"manual","regra":{},"precoMedio":11.92,"ativo":true,"descricaoRegra":""},{"id":"MI0301","categoria":"Mixes Artesanais","nome":"Coco Ralado","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":26,"ativo":true,"descricaoRegra":""},{"id":"MI0302","categoria":"Mixes Artesanais","nome":"Coentro","unidade":"molho","tipoRegra":"manual","regra":{},"precoMedio":2,"ativo":true,"descricaoRegra":"1 a cada 70 pessoas"},{"id":"MI0303","categoria":"Mixes Artesanais","nome":"Cominho","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""},{"id":"MI0304","categoria":"Mixes Artesanais","nome":"Cravo Da Índia","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":70,"ativo":true,"descricaoRegra":""},{"id":"MI0305","categoria":"Mixes Artesanais","nome":"Creme De leite","unidade":"cx","tipoRegra":"manual","regra":{},"precoMedio":3.94,"ativo":true,"descricaoRegra":""},{"id":"MI0306","categoria":"Mixes Artesanais","nome":"Damasco","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":58.4,"ativo":true,"descricaoRegra":""},{"id":"MI0307","categoria":"Mixes Artesanais","nome":"Doce Figo","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0308","categoria":"Mixes Artesanais","nome":"Doce LaranjaTerra","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":50,"ativo":true,"descricaoRegra":""},{"id":"MI0309","categoria":"Mixes Artesanais","nome":"Doce Leite","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0310","categoria":"Mixes Artesanais","nome":"Doce Sidra","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0311","categoria":"Mixes Artesanais","nome":"Especiarias G\u0026T","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":39,"ativo":true,"descricaoRegra":"1 a cada 100 pessoas"},{"id":"MI0312","categoria":"Mixes Artesanais","nome":"Estragão","unidade":"molho","tipoRegra":"manual","regra":{},"precoMedio":6.2,"ativo":true,"descricaoRegra":""},{"id":"MI0313","categoria":"Mixes Artesanais","nome":"Figo Seco","unidade":"400g","tipoRegra":"manual","regra":{},"precoMedio":33,"ativo":true,"descricaoRegra":"1 a cada 100 pessoas"},{"id":"MI0314","categoria":"Mixes Artesanais","nome":"Funcho","unidade":"molho","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0315","categoria":"Mixes Artesanais","nome":"Geleia Laranja","unidade":"vidro","tipoRegra":"manual","regra":{},"precoMedio":24.2,"ativo":true,"descricaoRegra":""},{"id":"MI0316","categoria":"Mixes Artesanais","nome":"Geleia Morango","unidade":"vidro","tipoRegra":"manual","regra":{},"precoMedio":24.2,"ativo":true,"descricaoRegra":""},{"id":"MI0317","categoria":"Mixes Artesanais","nome":"Goiabada","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":15.16,"ativo":true,"descricaoRegra":""},{"id":"MI0318","categoria":"Mixes Artesanais","nome":"Hortelã","unidade":"molho","tipoRegra":"manual","regra":{},"precoMedio":1.7,"ativo":true,"descricaoRegra":""},{"id":"MI0319","categoria":"Mixes Artesanais","nome":"Infusão artesanal","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":21.4,"ativo":true,"descricaoRegra":""},{"id":"MI0320","categoria":"Mixes Artesanais","nome":"Laranja Desidratada","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":250,"ativo":true,"descricaoRegra":""},{"id":"MI0321","categoria":"Mixes Artesanais","nome":"Leite Condensado","unidade":"cx","tipoRegra":"manual","regra":{},"precoMedio":5.94,"ativo":true,"descricaoRegra":""},{"id":"MI0322","categoria":"Mixes Artesanais","nome":"Leite De Coco","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":6.8,"ativo":true,"descricaoRegra":""},{"id":"MI0323","categoria":"Mixes Artesanais","nome":"Louro","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0324","categoria":"Mixes Artesanais","nome":"Maça Desidratada","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":250,"ativo":true,"descricaoRegra":""},{"id":"MI0325","categoria":"Mixes Artesanais","nome":"Manjericão","unidade":"molho","tipoRegra":"manual","regra":{},"precoMedio":1.7,"ativo":true,"descricaoRegra":""},{"id":"MI0326","categoria":"Mixes Artesanais","nome":"Noz Moscada","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0327","categoria":"Mixes Artesanais","nome":"Nozes","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":70,"ativo":true,"descricaoRegra":""},{"id":"MI0328","categoria":"Mixes Artesanais","nome":"Nutella","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":27,"ativo":true,"descricaoRegra":""},{"id":"MI0329","categoria":"Mixes Artesanais","nome":"Páprica","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":15,"ativo":true,"descricaoRegra":""},{"id":"MI0330","categoria":"Mixes Artesanais","nome":"Pimenta Calabresa","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":60,"ativo":true,"descricaoRegra":""},{"id":"MI0331","categoria":"Mixes Artesanais","nome":"Pimenta Do Reino","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":40,"ativo":true,"descricaoRegra":""},{"id":"MI0332","categoria":"Mixes Artesanais","nome":"Pimenta Rosa","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":50,"ativo":true,"descricaoRegra":""},{"id":"MI0333","categoria":"Mixes Artesanais","nome":"Sálvia","unidade":"molho","tipoRegra":"manual","regra":{},"precoMedio":5.6,"ativo":true,"descricaoRegra":""},{"id":"MI0334","categoria":"Mixes Artesanais","nome":"Tabasco","unidade":"vidro","tipoRegra":"manual","regra":{},"precoMedio":14.48,"ativo":true,"descricaoRegra":""},{"id":"MI0335","categoria":"Mixes Artesanais","nome":"Tomilho","unidade":"molho","tipoRegra":"manual","regra":{},"precoMedio":6.2,"ativo":true,"descricaoRegra":"1 a cada 300 pessoas"},{"id":"MI0336","categoria":"Mixes Artesanais","nome":"Wasabi","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":50,"ativo":true,"descricaoRegra":""},{"id":"MI0337","categoria":"Mixes Artesanais","nome":"Zimbro","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":166,"ativo":true,"descricaoRegra":""},{"id":"MI0338","categoria":"Mixes Artesanais","nome":"Garnish","unidade":"0","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0339","categoria":"Mixes Artesanais","nome":"Algodão Doce","unidade":"pote","tipoRegra":"manual","regra":{},"precoMedio":5,"ativo":true,"descricaoRegra":""},{"id":"MI0340","categoria":"Mixes Artesanais","nome":"Bala Caramelo","unidade":"840g","tipoRegra":"manual","regra":{},"precoMedio":11.9,"ativo":true,"descricaoRegra":""},{"id":"MI0341","categoria":"Mixes Artesanais","nome":"Bala Goma","unidade":"700g","tipoRegra":"manual","regra":{},"precoMedio":20,"ativo":true,"descricaoRegra":""},{"id":"MI0342","categoria":"Mixes Artesanais","nome":"Bala Gelatina","unidade":"350g","tipoRegra":"manual","regra":{},"precoMedio":20,"ativo":true,"descricaoRegra":""},{"id":"MI0343","categoria":"Mixes Artesanais","nome":"Marshmallow","unidade":"pacote","tipoRegra":"manual","regra":{},"precoMedio":18,"ativo":true,"descricaoRegra":""},{"id":"MI0344","categoria":"Mixes Artesanais","nome":"Bala Marshmallow","unidade":"500g","tipoRegra":"manual","regra":{},"precoMedio":14.99,"ativo":true,"descricaoRegra":""},{"id":"MI0345","categoria":"Mixes Artesanais","nome":"Canudo Colorido","unidade":"100uni","tipoRegra":"manual","regra":{},"precoMedio":6.4,"ativo":true,"descricaoRegra":""},{"id":"MI0346","categoria":"Mixes Artesanais","nome":"Canudo Comestível","unidade":"0","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0347","categoria":"Mixes Artesanais","nome":"Canudo Papel","unidade":"100uni","tipoRegra":"manual","regra":{},"precoMedio":44.5,"ativo":true,"descricaoRegra":""},{"id":"MI0348","categoria":"Mixes Artesanais","nome":"Confete","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":19.9,"ativo":true,"descricaoRegra":""},{"id":"MI0349","categoria":"Mixes Artesanais","nome":"Flor Comestível","unidade":"pote","tipoRegra":"manual","regra":{},"precoMedio":12,"ativo":true,"descricaoRegra":""},{"id":"MI0350","categoria":"Mixes Artesanais","nome":"Garrafinha","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":0.7,"ativo":true,"descricaoRegra":""},{"id":"MI0351","categoria":"Mixes Artesanais","nome":"Granulado","unidade":"kg","tipoRegra":"manual","regra":{},"precoMedio":11.99,"ativo":true,"descricaoRegra":""},{"id":"MI0352","categoria":"Mixes Artesanais","nome":"Gravatinha","unidade":"100uni","tipoRegra":"manual","regra":{},"precoMedio":25,"ativo":true,"descricaoRegra":""},{"id":"MI0353","categoria":"Mixes Artesanais","nome":"Maçarico","unidade":"refil","tipoRegra":"manual","regra":{},"precoMedio":20,"ativo":true,"descricaoRegra":""},{"id":"MI0354","categoria":"Mixes Artesanais","nome":"Mexedor","unidade":"100uni","tipoRegra":"manual","regra":{},"precoMedio":40,"ativo":true,"descricaoRegra":""},{"id":"MI0355","categoria":"Mixes Artesanais","nome":"Mini Pregador","unidade":"100uni","tipoRegra":"manual","regra":{},"precoMedio":15,"ativo":true,"descricaoRegra":""},{"id":"MI0356","categoria":"Mixes Artesanais","nome":"Palito Luxo","unidade":"100uni","tipoRegra":"manual","regra":{},"precoMedio":18,"ativo":true,"descricaoRegra":""},{"id":"MI0357","categoria":"Mixes Artesanais","nome":"Palito Simples","unidade":"100uni","tipoRegra":"manual","regra":{},"precoMedio":7,"ativo":true,"descricaoRegra":""},{"id":"MI0358","categoria":"Mixes Artesanais","nome":"Papel de arroz","unidade":"100uni","tipoRegra":"manual","regra":{},"precoMedio":350,"ativo":true,"descricaoRegra":""},{"id":"MI0359","categoria":"Mixes Artesanais","nome":"Pérola","unidade":"cartela","tipoRegra":"manual","regra":{},"precoMedio":8.9,"ativo":true,"descricaoRegra":""},{"id":"MI0360","categoria":"Mixes Artesanais","nome":"Pingente","unidade":"50uni","tipoRegra":"manual","regra":{},"precoMedio":25,"ativo":true,"descricaoRegra":""},{"id":"MI0361","categoria":"Mixes Artesanais","nome":"Pipeta","unidade":"100uni","tipoRegra":"manual","regra":{},"precoMedio":28,"ativo":true,"descricaoRegra":""},{"id":"MI0362","categoria":"Mixes Artesanais","nome":"Pirulito","unidade":"500g","tipoRegra":"manual","regra":{},"precoMedio":6.5,"ativo":true,"descricaoRegra":""},{"id":"MI0363","categoria":"Mixes Artesanais","nome":"Sombrinha","unidade":"100uni","tipoRegra":"manual","regra":{},"precoMedio":30.42,"ativo":true,"descricaoRegra":""},{"id":"MI0364","categoria":"Mixes Artesanais","nome":"Tag","unidade":"50uni","tipoRegra":"manual","regra":{},"precoMedio":50,"ativo":true,"descricaoRegra":""},{"id":"MI0365","categoria":"Sorvetes","nome":"Açaí","unidade":"0","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0366","categoria":"Sorvetes","nome":"Picolé Alcóolico","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0367","categoria":"Sorvetes","nome":"Picolé Simples","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":2.5,"ativo":true,"descricaoRegra":""},{"id":"MI0368","categoria":"Sorvetes","nome":"Picolé Padrão","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":3.1,"ativo":true,"descricaoRegra":""},{"id":"MI0369","categoria":"Sorvetes","nome":"Picolé Luxo","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":4.8,"ativo":true,"descricaoRegra":""},{"id":"MI0370","categoria":"Sorvetes","nome":"Sorvete Simples","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0371","categoria":"Sorvetes","nome":"Sorvete Padrão","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":0,"ativo":true,"descricaoRegra":""},{"id":"MI0372","categoria":"Sorvetes","nome":"Sorvete Luxo","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":37,"ativo":true,"descricaoRegra":""},{"id":"MI0373","categoria":"Shots","nome":"Tubo de ensaio","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":0.8,"ativo":true,"descricaoRegra":""},{"id":"MI0374","categoria":"Shots","nome":"Garrafinha","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":1.2,"ativo":true,"descricaoRegra":""},{"id":"MI0375","categoria":"Shots","nome":"Seringa","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":0.7,"ativo":true,"descricaoRegra":""},{"id":"MI0376","categoria":"Shots","nome":"Jelly Simples","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":1.2,"ativo":true,"descricaoRegra":""},{"id":"MI0377","categoria":"Shots","nome":"Jelly Complexo","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":1.7,"ativo":true,"descricaoRegra":""},{"id":"MI0378","categoria":"Shots","nome":"Champannheira","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":35,"ativo":true,"descricaoRegra":""},{"id":"MI0379","categoria":"Shots","nome":"Balde de Gelo","unidade":"uni","tipoRegra":"manual","regra":{},"precoMedio":30,"ativo":true,"descricaoRegra":""}]
;

var MOTOR_FATORES_PADRAO = {
  expectativa:  { muito_baixo:0.70, baixo:0.90, padrao:1.00, alto:1.15, muito_alto:1.35, formatura:1.60 },
  complexidade: { baixa:0.9, padrao:1.0, alta:1.1, muito_alta:1.2 },
};

var MOTOR_MARGEM_PADRAO = {
  matriz: {
    area_central:      [1,2,2,3,3,4,4,5,5,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17],
    jardim_canada:      [2,2,3,3,4,4,5,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17],
    reg_metropolitana:  [2,3,3,4,4,5,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17],
    viagem_60_100:      [3,3,4,4,4,5,5,5,6,6,6,7,7,7,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17],
    viagem_100_200:     [4,4,5,5,5,6,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17,18],
    viagem_200_300:     [4,4,5,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17,18,18],
    viagem_300_400:     [5,5,6,6,6,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17,18,18,18,18,19],
    viagem_geral:       [6,6,7,7,7,8,8,8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,13,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19],
  },
  fatorValorFaixas: [
    { ate:1000,  fator:1.3 },
    { ate:3000,  fator:1.2 },
    { ate:5000,  fator:1.1 },
    { ate:8000,  fator:1.0 },
    { ate:11000, fator:0.9 },
    { ate:null,  fator:0.8 },
  ],
};

function initMotorCalculo() {
  if (!D.motorCatalogo || !D.motorCatalogo.length) D.motorCatalogo = JSON.parse(JSON.stringify(MOTOR_CATALOGO_PADRAO));
  if (!D.motorFatores) D.motorFatores = JSON.parse(JSON.stringify(MOTOR_FATORES_PADRAO));
  if (!D.motorMargemSeguranca) D.motorMargemSeguranca = JSON.parse(JSON.stringify(MOTOR_MARGEM_PADRAO));
}

// ─── MOTOR (funções puras) ────────────────────────────────────────────────────

// Avaliador de fórmula seguro: só aceita "convidados", números, espaços e + - * / ( ).
// Autoria das fórmulas é só da Juliana via tela de admin (mesmo nível de confiança
// de qualquer outro número de regra já editável hoje no app) — por isso um allowlist
// + Function é suficiente, sem precisar de um parser recursivo dedicado.
function _motorFormula(formulaStr, ctx) {
  var expr = String(formulaStr || '').trim();
  if (!expr) return 0;
  var semVar = expr.replace(/convidados/g, '0');
  if (!/^[0-9+\-*/().\s]+$/.test(semVar)) {
    console.error('Motor: fórmula inválida (caractere não permitido):', formulaStr);
    return 0;
  }
  try {
    // eslint-disable-next-line no-new-func
    return Function('convidados', 'return (' + expr + ');')(ctx.convidados);
  } catch (e) {
    console.error('Motor: erro ao avaliar fórmula:', formulaStr, e);
    return 0;
  }
}

function _motorQtdPatamarSimples(r, convidados) {
  var minimo = Number(r.minimo || 0);
  var minimoAte = Number(r.minimoAte || 0);
  var incrementoACada = Number(r.incrementoACada || 1) || 1;
  var incremento = Number(r.incremento || 0);
  if (convidados <= minimoAte) return Math.ceil(minimo);
  return Math.ceil(minimo + ((convidados - minimoAte) / incrementoACada) * incremento);
}

function _motorQtdPatamarFaixas(r, convidados, ctx) {
  var faixas = r.faixas || [];
  var faixa = null;
  for (var i = 0; i < faixas.length; i++) {
    if (faixas[i].ate == null || convidados <= faixas[i].ate) { faixa = faixas[i]; break; }
  }
  if (!faixa) faixa = faixas[faixas.length - 1];
  if (!faixa) return 0;
  return Math.ceil(_motorFormula(faixa.formula, ctx));
}

// Reaproveita o Ref. Consumo já existente (refConsumo.js) em vez de recriar os
// polinômios de grau 6 da planilha antiga — decisão explícita da Juliana.
function _motorQtdDestilado(item, ctx) {
  var r = item.regra || {};
  var rcNome = r.rcNomeOverride || ((typeof _rcMapFichaItemToRC === 'function') ? _rcMapFichaItemToRC(item.nome) : null);
  if (!rcNome) return 0;
  var grupoRC = (typeof _calcTipoToGrupoRC === 'function') ? _calcTipoToGrupoRC(ctx.tipoEvento) : 'CASAMENTO';
  var stats = (typeof _rcGetStats === 'function') ? _rcGetStats() : {};
  var gd = (stats[grupoRC] || {})[rcNome];
  var avg = (gd && gd.avg != null) ? gd.avg : ((gd && gd.mediaGeral != null) ? gd.mediaGeral : null);
  if (avg == null) return 0;
  return (typeof _rcSugestao === 'function') ? _rcSugestao(avg) : Math.ceil(avg * (avg < 18 ? 1.20 : 1.15));
}

function _motorQtdBase(item, ctx) {
  var r = item.regra || {};
  switch (item.tipoRegra) {
    case 'manual': {
      var found = (ctx.motorItens || []).find(function(mi) { return mi.itemId === item.id; });
      return (found && found.qtdManualOverride != null) ? Number(found.qtdManualOverride) : 0;
    }
    case 'patamar':
      return r.modo === 'faixas' ? _motorQtdPatamarFaixas(r, ctx.convidados, ctx) : _motorQtdPatamarSimples(r, ctx.convidados);
    case 'porPessoa': {
      var porQtd = Number(r.porQtd || 1) || 1;
      return Math.ceil(Math.max(Number(r.minimo || 0), ctx.convidados / porQtd));
    }
    case 'porEquipe': {
      var porMembro = Number(r.porMembro || 1);
      return Math.ceil(Math.max(Number(r.minimo || 0), ctx.equipeTotal * porMembro));
    }
    case 'faixaDestilado':
      return _motorQtdDestilado(item, ctx);
    default:
      return 0;
  }
}

// Faixas de valor do orçamento: todos os limites são "menor que" (confirmado na
// fórmula real do Excel, IF(N2<1000,...IF(N2<3000,...)) — não "entre X e Y".
function _motorFatorValor(custoPresente, faixas) {
  faixas = faixas || MOTOR_MARGEM_PADRAO.fatorValorFaixas;
  for (var i = 0; i < faixas.length; i++) {
    if (faixas[i].ate == null) return faixas[i].fator;
    if (custoPresente < faixas[i].ate) return faixas[i].fator;
  }
  return faixas[faixas.length - 1].fator;
}

function _motorMesesEntreDatas(dataBase, dataEvento) {
  if (!dataBase || !dataEvento) return 0;
  var ms = new Date(dataEvento) - new Date(dataBase);
  if (!isFinite(ms) || ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24 * 30));
}

// Ponto de entrada único do motor. Função pura: lê D.motorCatalogo/D.motorFatores/
// D.motorMargemSeguranca e orc.motorParams/orc.motorItens, não muta D nem chama sv().
function motorCalcular(orc) {
  var mp = orc.motorParams || {};
  var convidados = Number(orc.convidados || 0);
  var tipoEvento = (orc.calcParams && orc.calcParams.tipoEvento) || 'outros';
  var equipeTotal = 0;
  if (typeof _calcAutoStaff === 'function') {
    var autoS = _calcAutoStaff(convidados);
    equipeTotal = Object.keys(autoS).reduce(function(s, k) { return s + (autoS[k] || 0); }, 0);
  }

  var ctx = { convidados: convidados, tipoEvento: tipoEvento, equipeTotal: equipeTotal, motorItens: orc.motorItens || [] };

  var catalogo = D.motorCatalogo || MOTOR_CATALOGO_PADRAO;
  var itensSelecionados = (orc.motorItens || [])
    .map(function(mi) { return catalogo.find(function(c) { return c.id === mi.itemId; }); })
    .filter(Boolean);

  var fatoresData = D.motorFatores || MOTOR_FATORES_PADRAO;
  var nivelExp = mp.nivelExpectativa || 'padrao';
  var fatorExp = (fatoresData.expectativa && fatoresData.expectativa[nivelExp] != null) ? fatoresData.expectativa[nivelExp] : 1;

  var itensCalculados = itensSelecionados.map(function(item) {
    var qtdBase = _motorQtdBase(item, ctx);
    // manual (sem fórmula) e faixaDestilado (já usa a margem de segurança própria do
    // Ref.Consumo) não recebem o fator de expectativa por cima — mesmo comportamento
    // da planilha original (colunas AZ/BA dos destilados não usam a tabela de expectativa).
    var qtdFinal = (item.tipoRegra === 'manual' || item.tipoRegra === 'faixaDestilado')
      ? qtdBase
      : Math.ceil(fatorExp * qtdBase);
    var precoMedio = Number(item.precoMedio || 0);
    return {
      itemId: item.id, nome: item.nome, categoria: item.categoria,
      quantidadeBase: qtdBase, quantidadeFinal: qtdFinal,
      precoMedio: precoMedio, subtotal: Math.round(qtdFinal * precoMedio * 100) / 100,
      origem: item.tipoRegra,
    };
  });

  var custoPresente = Math.round(itensCalculados.reduce(function(s, i) { return s + i.subtotal; }, 0) * 100) / 100;

  var margemData = D.motorMargemSeguranca || MOTOR_MARGEM_PADRAO;
  var meses = _motorMesesEntreDatas(mp.dataBaseOrcamento, orc.dataEvento);
  var localArr = (margemData.matriz && margemData.matriz[mp.local]) || [];
  var mesIdx = Math.min(Math.max(meses, 0), Math.max(localArr.length - 1, 0));
  var fatorMatriz = localArr.length ? Number(localArr[mesIdx] || 0) : 0;
  var fatorValor = _motorFatorValor(custoPresente, margemData.fatorValorFaixas);
  var complexidadeKey = mp.complexidade || 'padrao';
  var fatorComplexidade = (fatoresData.complexidade && fatoresData.complexidade[complexidadeKey] != null) ? fatoresData.complexidade[complexidadeKey] : 1;
  var margemSegurancaPct = Math.floor(fatorMatriz * fatorValor * fatorComplexidade) / 100;

  var custoEstimado = Math.round(custoPresente * (1 + margemSegurancaPct) * 100) / 100;
  var margemLucro = Number(mp.margemLucro != null ? mp.margemLucro : 30) / 100;
  var lucro = Math.round(custoEstimado * margemLucro * 100) / 100;
  var aliquota = Number(mp.aliquotaImposto || 0) / 100;
  var valorTotal = Math.round((custoEstimado + lucro) * (1 + aliquota) * 100) / 100;
  var valorPorPessoa = convidados > 0 ? Math.round((valorTotal / convidados) * 100) / 100 : 0;

  return {
    itensCalculados: itensCalculados, custoPresente: custoPresente, margemSeguranca: margemSegurancaPct,
    custoEstimado: custoEstimado, lucro: lucro, valorTotal: valorTotal, valorPorPessoa: valorPorPessoa,
    debug: { meses: meses, fatorMatriz: fatorMatriz, fatorValor: fatorValor, fatorComplexidade: fatorComplexidade },
  };
}

// ─── ADMIN: CATÁLOGO DE ITENS ─────────────────────────────────────────────────

var _motorRegraAberta = null;   // id do item com o painel de regra expandido
var _motorCatFiltro    = { cat: '', busca: '' };

function _motorRegraLabel(tipo) {
  return { manual:'Manual', patamar:'Patamar', faixaDestilado:'Faixa (Destilado)', porPessoa:'Por Pessoa', porEquipe:'Por Equipe' }[tipo] || tipo;
}

function _motorRegraDefault(tipo) {
  if (tipo === 'patamar') return { modo:'simples', minimo:1, minimoAte:100, incrementoACada:100, incremento:1 };
  if (tipo === 'porPessoa') return { porQtd:20, minimo:1 };
  if (tipo === 'porEquipe') return { porMembro:1, minimo:1 };
  if (tipo === 'faixaDestilado') return {};
  return {};
}

function rMotorCatalogo() {
  var el = document.getElementById('regras-view-motor-catalogo');
  if (!el) return;
  var catalogo = D.motorCatalogo || [];

  var categorias = Array.from(new Set(catalogo.map(function(i) { return i.categoria; }))).sort();
  var busca = (_motorCatFiltro.busca || '').toLowerCase();

  var visiveis = catalogo
    .map(function(item, idx) { return { item: item, idx: idx }; })
    .filter(function(e) {
      if (_motorCatFiltro.cat && e.item.categoria !== _motorCatFiltro.cat) return false;
      if (busca && e.item.nome.toLowerCase().indexOf(busca) === -1) return false;
      return true;
    });

  var porCat = {};
  visiveis.forEach(function(e) {
    if (!porCat[e.item.categoria]) porCat[e.item.categoria] = [];
    porCat[e.item.categoria].push(e);
  });

  var html = '<div class="sec">' +
    '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">' +
      '<span class="sec-title">🧾 Catálogo de Itens (Motor)</span>' +
      '<div style="display:flex;gap:8px">' +
        '<button class="btn" onclick="adicionarItemCatalogo()" style="background:var(--blue)">+ Novo Item</button>' +
        '<button class="btn" onclick="salvarMotorCatalogo()" style="background:var(--green)">💾 Salvar</button>' +
      '</div>' +
    '</div>' +
    '<div style="padding:12px 16px;display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end">' +
      '<div><label class="lbl">Categoria</label><select class="inp" onchange="motorSetFiltroCat(this.value)">' +
        '<option value="">Todas</option>' +
        categorias.map(function(c) { return '<option value="' + c + '"' + (_motorCatFiltro.cat === c ? ' selected' : '') + '>' + c + '</option>'; }).join('') +
      '</select></div>' +
      '<div><label class="lbl">Buscar</label><input class="inp" type="text" value="' + (_motorCatFiltro.busca || '') + '" placeholder="Nome do item..." onchange="motorSetFiltroBusca(this.value)"></div>' +
    '</div>';

  Object.keys(porCat).sort().forEach(function(cat) {
    html += '<div style="padding:0 16px 12px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;border-bottom:2px solid var(--border2);padding-bottom:4px;margin-bottom:8px">' + cat + '</div>' +
      '<div style="display:grid;gap:6px">';

    porCat[cat].forEach(function(e) {
      var item = e.item, idx = e.idx;
      html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--radius);padding:8px 12px">' +
        '<div style="display:grid;grid-template-columns:1fr 90px 150px 100px 60px 90px;gap:8px;align-items:center;font-size:11px">' +
          '<input type="text" value="' + item.nome + '" style="font-size:11px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text)" onchange="atualizarCatalogoItem(' + idx + ',\'nome\',this.value)">' +
          '<input type="text" value="' + item.unidade + '" style="font-size:11px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text)" onchange="atualizarCatalogoItem(' + idx + ',\'unidade\',this.value)">' +
          '<select style="font-size:10px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text)" onchange="setCatalogoTipoRegra(' + idx + ',this.value)">' +
            ['manual','patamar','faixaDestilado','porPessoa','porEquipe'].map(function(t) {
              return '<option value="' + t + '"' + (item.tipoRegra === t ? ' selected' : '') + '>' + _motorRegraLabel(t) + '</option>';
            }).join('') +
          '</select>' +
          '<input type="number" step="0.01" min="0" value="' + item.precoMedio + '" style="font-size:11px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono)" onchange="atualizarCatalogoItem(' + idx + ',\'precoMedio\',parseFloat(this.value)||0)">' +
          '<div style="text-align:center"><input type="checkbox" ' + (item.ativo ? 'checked' : '') + ' onchange="atualizarCatalogoItem(' + idx + ',\'ativo\',this.checked)" style="cursor:pointer"></div>' +
          '<div style="display:flex;gap:4px;justify-content:flex-end">' +
            '<button class="btn-sm" onclick="motorToggleRegra(\'' + item.id + '\')">⚙️ Regra</button>' +
            '<button class="btn-sm btn-red" onclick="excluirItemCatalogo(' + idx + ')">🗑️</button>' +
          '</div>' +
        '</div>' +
        (_motorRegraAberta === item.id ? _motorRenderPainelRegra(item, idx) : '') +
      '</div>';
    });

    html += '</div></div>';
  });

  if (!visiveis.length) html += '<div style="padding:20px;text-align:center;color:var(--text3)">Nenhum item encontrado.</div>';

  html += '</div>';
  el.innerHTML = html;
}

function _motorRenderPainelRegra(item, idx) {
  var r = item.regra || {};
  var html = '<div style="margin-top:8px;padding:10px;background:var(--bg);border:1px solid var(--border2);border-radius:6px;font-size:11px">';

  if (item.descricaoRegra) {
    html += '<div style="color:var(--amber);margin-bottom:8px">📋 Regra de bolso (da planilha original): "' + item.descricaoRegra + '"</div>';
  }

  if (item.tipoRegra === 'manual') {
    html += '<span style="color:var(--text3)">Quantidade digitada manualmente em cada orçamento — sem fórmula.' +
      (item.descricaoRegra ? ' A fórmula original dependia de outra célula (tipo de copo, local etc.) e não foi convertida automaticamente — use a regra de bolso acima para digitar a quantidade, ou configure uma regra de patamar aqui.' : '') +
      '</span>';
  } else if (item.tipoRegra === 'porPessoa') {
    html += '<div style="display:flex;gap:16px">' +
      '<div><label class="lbl">1 unidade a cada (convidados)</label><input type="number" step="0.1" min="0.1" value="' + (r.porQtd||0) + '" class="inp" style="width:100px" onchange="atualizarCatalogoRegra(' + idx + ',\'porQtd\',parseFloat(this.value)||1)"></div>' +
      '<div><label class="lbl">Mínimo</label><input type="number" min="0" value="' + (r.minimo||0) + '" class="inp" style="width:100px" onchange="atualizarCatalogoRegra(' + idx + ',\'minimo\',parseFloat(this.value)||0)"></div>' +
    '</div>';
  } else if (item.tipoRegra === 'porEquipe') {
    html += '<div style="display:flex;gap:16px">' +
      '<div><label class="lbl">Unidades por membro da equipe</label><input type="number" step="0.1" min="0" value="' + (r.porMembro||0) + '" class="inp" style="width:100px" onchange="atualizarCatalogoRegra(' + idx + ',\'porMembro\',parseFloat(this.value)||0)"></div>' +
      '<div><label class="lbl">Mínimo</label><input type="number" min="0" value="' + (r.minimo||0) + '" class="inp" style="width:100px" onchange="atualizarCatalogoRegra(' + idx + ',\'minimo\',parseFloat(this.value)||0)"></div>' +
    '</div>';
  } else if (item.tipoRegra === 'faixaDestilado') {
    var autoResolve = (typeof _rcMapFichaItemToRC === 'function') ? (_rcMapFichaItemToRC(item.nome) || '—') : '—';
    html += '<div><label class="lbl">Nome no Ref. Consumo (deixe vazio para detectar automaticamente pelo nome do item)</label>' +
      '<input type="text" value="' + (r.rcNomeOverride||'') + '" class="inp" style="width:220px" placeholder="Ex: Vodka" onchange="atualizarCatalogoRegra(' + idx + ',\'rcNomeOverride\',this.value)"></div>' +
      '<div style="margin-top:6px;color:var(--text3)">Detecção automática pelo nome atual: <strong>' + autoResolve + '</strong></div>';
  } else if (item.tipoRegra === 'patamar') {
    html += '<div style="margin-bottom:8px"><label class="lbl">Modo</label>' +
      '<select class="inp" style="width:140px" onchange="setCatalogoModoPatamar(' + idx + ',this.value)">' +
        '<option value="simples"' + (r.modo!=='faixas'?' selected':'') + '>Mínimo + incremento</option>' +
        '<option value="faixas"' + (r.modo==='faixas'?' selected':'') + '>Múltiplas faixas</option>' +
      '</select></div>';
    if (r.modo === 'faixas') {
      html += '<div style="display:grid;gap:6px">';
      (r.faixas||[]).forEach(function(f, fi) {
        html += '<div style="display:flex;gap:8px;align-items:center">' +
          '<label style="font-size:9px;color:var(--text3)">Até</label>' +
          '<input type="number" min="0" value="' + (f.ate==null?'':f.ate) + '" placeholder="(final)" style="width:80px;font-size:11px;padding:3px 6px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text)" onchange="atualizarFaixaPatamar(' + idx + ',' + fi + ',\'ate\',this.value===\'\'?null:parseFloat(this.value))">' +
          '<label style="font-size:9px;color:var(--text3)">Fórmula</label>' +
          '<input type="text" value="' + f.formula + '" style="flex:1;font-size:11px;padding:3px 6px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono)" onchange="atualizarFaixaPatamar(' + idx + ',' + fi + ',\'formula\',this.value)">' +
          '<button class="btn-sm btn-red" onclick="removerFaixaPatamar(' + idx + ',' + fi + ')">×</button>' +
        '</div>';
      });
      html += '</div><button class="btn-sm" style="margin-top:6px" onclick="adicionarFaixaPatamar(' + idx + ')">+ Faixa</button>';
    } else {
      html += '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
        '<div><label class="lbl">Mínimo</label><input type="number" min="0" value="' + (r.minimo||0) + '" class="inp" style="width:80px" onchange="atualizarCatalogoRegra(' + idx + ',\'minimo\',parseFloat(this.value)||0)"></div>' +
        '<div><label class="lbl">Até (convidados)</label><input type="number" min="0" value="' + (r.minimoAte||0) + '" class="inp" style="width:80px" onchange="atualizarCatalogoRegra(' + idx + ',\'minimoAte\',parseFloat(this.value)||0)"></div>' +
        '<div><label class="lbl">Incremento a cada</label><input type="number" min="1" value="' + (r.incrementoACada||1) + '" class="inp" style="width:80px" onchange="atualizarCatalogoRegra(' + idx + ',\'incrementoACada\',parseFloat(this.value)||1)"></div>' +
        '<div><label class="lbl">Incremento</label><input type="number" min="0" value="' + (r.incremento||0) + '" class="inp" style="width:80px" onchange="atualizarCatalogoRegra(' + idx + ',\'incremento\',parseFloat(this.value)||0)"></div>' +
      '</div>';
    }
  }

  html += '</div>';
  return html;
}

function motorSetFiltroCat(v) { _motorCatFiltro.cat = v; rMotorCatalogo(); }
function motorSetFiltroBusca(v) { _motorCatFiltro.busca = v; rMotorCatalogo(); }
function motorToggleRegra(itemId) { _motorRegraAberta = (_motorRegraAberta === itemId) ? null : itemId; rMotorCatalogo(); }

function atualizarCatalogoItem(idx, campo, valor) {
  if (!D.motorCatalogo || !D.motorCatalogo[idx]) return;
  D.motorCatalogo[idx][campo] = valor;
  if (campo !== 'nome' && campo !== 'unidade' && campo !== 'precoMedio' && campo !== 'ativo') rMotorCatalogo();
}

function setCatalogoTipoRegra(idx, tipo) {
  if (!D.motorCatalogo || !D.motorCatalogo[idx]) return;
  D.motorCatalogo[idx].tipoRegra = tipo;
  D.motorCatalogo[idx].regra = _motorRegraDefault(tipo);
  rMotorCatalogo();
}

function setCatalogoModoPatamar(idx, modo) {
  var item = D.motorCatalogo && D.motorCatalogo[idx];
  if (!item) return;
  item.regra = modo === 'faixas'
    ? { modo:'faixas', faixas:[{ ate:null, formula:'convidados/10' }] }
    : { modo:'simples', minimo:1, minimoAte:100, incrementoACada:100, incremento:1 };
  rMotorCatalogo();
}

function atualizarCatalogoRegra(idx, campo, valor) {
  var item = D.motorCatalogo && D.motorCatalogo[idx];
  if (!item) return;
  if (!item.regra) item.regra = {};
  item.regra[campo] = valor;
}

function adicionarFaixaPatamar(idx) {
  var item = D.motorCatalogo && D.motorCatalogo[idx];
  if (!item || !item.regra || !item.regra.faixas) return;
  item.regra.faixas.push({ ate:null, formula:'convidados/10' });
  rMotorCatalogo();
}

function removerFaixaPatamar(idx, faixaIdx) {
  var item = D.motorCatalogo && D.motorCatalogo[idx];
  if (!item || !item.regra || !item.regra.faixas) return;
  item.regra.faixas.splice(faixaIdx, 1);
  rMotorCatalogo();
}

function atualizarFaixaPatamar(idx, faixaIdx, campo, valor) {
  var item = D.motorCatalogo && D.motorCatalogo[idx];
  if (!item || !item.regra || !item.regra.faixas || !item.regra.faixas[faixaIdx]) return;
  item.regra.faixas[faixaIdx][campo] = valor;
}

function adicionarItemCatalogo() {
  var nome = prompt('Nome do item:');
  if (!nome) return;
  var categoria = prompt('Categoria (ex: Gelo, Frutas, Destilados):') || 'Outros';
  if (!D.motorCatalogo) D.motorCatalogo = [];
  D.motorCatalogo.push({
    id: _gerarId('MI'), categoria: categoria, nome: nome, unidade: 'un',
    tipoRegra: 'manual', regra: {}, precoMedio: 0, ativo: true,
  });
  rMotorCatalogo();
}

function excluirItemCatalogo(idx) {
  if (!confirm('Excluir este item do catálogo?')) return;
  D.motorCatalogo.splice(idx, 1);
  rMotorCatalogo();
}

function salvarMotorCatalogo() {
  sv('motorCatalogo');
  alert2('Catálogo salvo!');
}

// ─── ADMIN: FATORES (EXPECTATIVA / COMPLEXIDADE) ──────────────────────────────

function rMotorFatores() {
  var el = document.getElementById('regras-view-motor-fatores');
  if (!el) return;
  var f = D.motorFatores || MOTOR_FATORES_PADRAO;
  var expLabels = { muito_baixo:'Muito baixo', baixo:'Baixo', padrao:'Padrão', alto:'Alto', muito_alto:'Muito alto', formatura:'Formatura' };
  var cxLabels  = { baixa:'Baixa', padrao:'Padrão', alta:'Alta', muito_alta:'Muito alta' };

  el.innerHTML = '<div class="sec">' +
    '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center">' +
      '<span class="sec-title">🎚️ Fatores Multiplicadores (Motor)</span>' +
      '<button class="btn" onclick="salvarMotorFatores()" style="background:var(--green)">💾 Salvar</button>' +
    '</div>' +
    '<div style="padding:14px 16px;display:flex;gap:32px;flex-wrap:wrap">' +
      '<div>' +
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:8px">Expectativa de Consumo</div>' +
        Object.keys(expLabels).map(function(k) {
          return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px">' +
            '<label style="font-size:11px;color:var(--text2);min-width:110px">' + expLabels[k] + '</label>' +
            '<input id="mf-exp-' + k + '" type="number" step="0.01" min="0" value="' + (f.expectativa[k] != null ? f.expectativa[k] : 1) + '" style="width:80px;font-size:11px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono);text-align:center">' +
          '</div>';
        }).join('') +
        '<div style="font-size:9px;color:var(--amber);margin-top:4px;max-width:260px">"Formatura" está nesta lista porque assim está na planilha original (é usada como nível de consumo, não só tipo de evento) — mantido de propósito.</div>' +
      '</div>' +
      '<div>' +
        '<div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:8px">Complexidade do Evento</div>' +
        Object.keys(cxLabels).map(function(k) {
          return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px">' +
            '<label style="font-size:11px;color:var(--text2);min-width:110px">' + cxLabels[k] + '</label>' +
            '<input id="mf-cx-' + k + '" type="number" step="0.01" min="0" value="' + (f.complexidade[k] != null ? f.complexidade[k] : 1) + '" style="width:80px;font-size:11px;padding:4px 6px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono);text-align:center">' +
          '</div>';
        }).join('') +
        '<div style="font-size:9px;color:var(--text3);margin-top:4px;max-width:260px">Multiplica dentro da fórmula de Margem de Segurança.</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function salvarMotorFatores() {
  if (!D.motorFatores) D.motorFatores = JSON.parse(JSON.stringify(MOTOR_FATORES_PADRAO));
  ['muito_baixo','baixo','padrao','alto','muito_alto','formatura'].forEach(function(k) {
    var el = document.getElementById('mf-exp-' + k);
    if (el) D.motorFatores.expectativa[k] = parseFloat(el.value) || 0;
  });
  ['baixa','padrao','alta','muito_alta'].forEach(function(k) {
    var el = document.getElementById('mf-cx-' + k);
    if (el) D.motorFatores.complexidade[k] = parseFloat(el.value) || 0;
  });
  sv('motorFatores');
  alert2('Fatores salvos!');
}

// ─── ADMIN: MARGEM DE SEGURANÇA (FAIXAS + MATRIZ) ─────────────────────────────

function rMotorMargem() {
  var el = document.getElementById('regras-view-motor-margem');
  if (!el) return;
  var m = D.motorMargemSeguranca || MOTOR_MARGEM_PADRAO;
  var faixas = m.fatorValorFaixas || [];
  var meses = (m.matriz && m.matriz[MOTOR_LOCAIS[0].key]) ? m.matriz[MOTOR_LOCAIS[0].key].length : 49;

  var html = '<div class="sec" style="margin-bottom:12px">' +
    '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center">' +
      '<span class="sec-title">🛡️ Faixas por Valor do Orçamento</span>' +
    '</div>' +
    '<div style="padding:12px 16px;font-size:11px;color:var(--text3);margin-bottom:4px">Todos os limites são "menor que" (confirmado na planilha original).</div>' +
    '<div style="padding:0 16px 14px;display:grid;gap:6px">' +
      faixas.map(function(f, i) {
        return '<div style="display:flex;align-items:center;gap:10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:6px 10px;font-size:11px">' +
          '<span style="min-width:70px;color:var(--text3)">Menor que</span>' +
          '<input id="mm-faixa-' + i + '-ate" type="number" min="0" value="' + (f.ate==null?'':f.ate) + '" placeholder="(último)" style="width:100px;font-size:11px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono)">' +
          '<span style="color:var(--text3)">→ fator</span>' +
          '<input id="mm-faixa-' + i + '-fator" type="number" step="0.01" min="0" value="' + f.fator + '" style="width:80px;font-size:11px;padding:4px 6px;background:var(--bg);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono)">' +
        '</div>';
      }).join('') +
    '</div>' +
  '</div>';

  html += '<div class="sec">' +
    '<div class="sec-head" style="display:flex;justify-content:space-between;align-items:center">' +
      '<span class="sec-title">🗺️ Matriz Local × Meses de Antecedência</span>' +
      '<button class="btn" onclick="salvarMotorMargem()" style="background:var(--green)">💾 Salvar</button>' +
    '</div>' +
    '<div style="padding:12px 16px;overflow-x:auto">' +
      '<table style="border-collapse:collapse;font-size:9px;font-family:var(--mono)">' +
        '<thead><tr>' +
          '<th style="padding:3px 6px;text-align:left;color:var(--text3);position:sticky;left:0;background:var(--bg2)">Local</th>' +
          Array.from({length:meses}, function(_, i) { return '<th style="padding:3px 5px;color:var(--text3);font-weight:500">' + i + '</th>'; }).join('') +
        '</tr></thead>' +
        '<tbody>' +
          MOTOR_LOCAIS.map(function(loc) {
            var arr = (m.matriz && m.matriz[loc.key]) || [];
            return '<tr>' +
              '<td style="padding:3px 6px;color:var(--text2);white-space:nowrap;position:sticky;left:0;background:var(--bg2)">' + loc.label + '</td>' +
              arr.map(function(v, mesIdx) {
                var cellId = 'mm-cel-' + loc.key + '-' + mesIdx;
                return '<td style="padding:2px;text-align:center;border:1px solid var(--border)">' +
                  '<input id="' + cellId + '" type="number" value="' + v + '" style="width:32px;font-size:9px;padding:2px;text-align:center;background:var(--bg3);border:none;color:var(--text);font-family:var(--mono)">' +
                '</td>';
              }).join('') +
            '</tr>';
          }).join('') +
        '</tbody>' +
      '</table>' +
    '</div>' +
    '<div style="padding:0 16px 14px">' +
      '<div style="font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;margin-bottom:6px">Colar matriz (CSV/TSV) — uma linha por local, na mesma ordem acima, 49 valores por linha</div>' +
      '<textarea id="mm-import-textarea" rows="3" style="width:100%;font-size:10px;font-family:var(--mono);background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);padding:6px"></textarea>' +
      '<button class="btn-sm" style="margin-top:6px" onclick="importarMatrizColada()">Importar matriz colada</button>' +
    '</div>' +
  '</div>';

  el.innerHTML = html;
}

function salvarMotorMargem() {
  if (!D.motorMargemSeguranca) D.motorMargemSeguranca = JSON.parse(JSON.stringify(MOTOR_MARGEM_PADRAO));
  var faixas = D.motorMargemSeguranca.fatorValorFaixas || [];
  faixas.forEach(function(f, i) {
    var ateEl = document.getElementById('mm-faixa-' + i + '-ate');
    var fatorEl = document.getElementById('mm-faixa-' + i + '-fator');
    if (ateEl) f.ate = ateEl.value === '' ? null : parseFloat(ateEl.value);
    if (fatorEl) f.fator = parseFloat(fatorEl.value) || 0;
  });
  MOTOR_LOCAIS.forEach(function(loc) {
    var arr = D.motorMargemSeguranca.matriz[loc.key] || [];
    arr.forEach(function(_, mesIdx) {
      var cel = document.getElementById('mm-cel-' + loc.key + '-' + mesIdx);
      if (cel) arr[mesIdx] = parseFloat(cel.value) || 0;
    });
  });
  sv('motorMargemSeguranca');
  alert2('Margem de segurança salva!');
}

function importarMatrizColada() {
  var txt = (document.getElementById('mm-import-textarea') || {}).value || '';
  var linhas = txt.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
  if (!linhas.length) { alert2('Cole os dados antes de importar.', 'error'); return; }
  if (!D.motorMargemSeguranca) D.motorMargemSeguranca = JSON.parse(JSON.stringify(MOTOR_MARGEM_PADRAO));
  linhas.forEach(function(linha, i) {
    if (i >= MOTOR_LOCAIS.length) return;
    var valores = linha.split(/\t|,/).map(function(v) { return parseFloat(v.trim()); }).filter(function(v) { return !isNaN(v); });
    if (valores.length) D.motorMargemSeguranca.matriz[MOTOR_LOCAIS[i].key] = valores;
  });
  rMotorMargem();
  alert2('Matriz atualizada — confira e clique em Salvar.');
}

// ─── 6ª ABA DO ORÇAMENTO: "MOTOR" ─────────────────────────────────────────────
// Não lê nem escreve orc.calcItens/orc.insumos — só orc.motorParams/orc.motorItens.

var MOTOR_NIVEIS_EXPECTATIVA = ['muito_baixo','baixo','padrao','alto','muito_alto','formatura'];
var MOTOR_NIVEIS_COMPLEXIDADE = ['baixa','padrao','alta','muito_alta'];

function _motorLabel(key) {
  return { muito_baixo:'Muito baixo', baixo:'Baixo', padrao:'Padrão', alto:'Alto', muito_alto:'Muito alto', formatura:'Formatura',
           baixa:'Baixa', alta:'Alta', muito_alta:'Muito alta' }[key] || key;
}

function rOrcMotor(orc) {
  var el = document.getElementById('orc-det-content');
  if (!el) return;

  if (!orc.motorParams) {
    orc.motorParams = {
      dataBaseOrcamento: (orc.criadoEm || new Date().toISOString()).slice(0, 10),
      local: (orc.calcParams && orc.calcParams.local) ? _motorMapCalcLocalParaMotor(orc.calcParams.local) : MOTOR_LOCAIS[0].key,
      nivelExpectativa: 'padrao', complexidade: 'padrao', margemLucro: 30, aliquotaImposto: 0,
    };
  }
  if (!orc.motorItens) orc.motorItens = [];

  var mp = orc.motorParams;
  var catalogo = D.motorCatalogo || MOTOR_CATALOGO_PADRAO;
  var porCat = {};
  catalogo.filter(function(i) { return i.ativo !== false; }).forEach(function(item) {
    if (!porCat[item.categoria]) porCat[item.categoria] = [];
    porCat[item.categoria].push(item);
  });

  var paramsHtml = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">⚙️ Parâmetros do Motor</div>' +
    '<div style="display:flex;gap:12px;flex-wrap:wrap">' +
      '<div><label class="lbl">Data base do orçamento</label><input type="date" class="inp" value="' + mp.dataBaseOrcamento + '" onchange="motorSetParam(\'' + orc.id + '\',\'dataBaseOrcamento\',this.value)"></div>' +
      '<div><label class="lbl">Local</label><select class="inp" onchange="motorSetParam(\'' + orc.id + '\',\'local\',this.value)">' +
        MOTOR_LOCAIS.map(function(l) { return '<option value="' + l.key + '"' + (mp.local === l.key ? ' selected' : '') + '>' + l.label + '</option>'; }).join('') +
      '</select></div>' +
      '<div><label class="lbl">Expectativa de Consumo</label><select class="inp" onchange="motorSetParam(\'' + orc.id + '\',\'nivelExpectativa\',this.value)">' +
        MOTOR_NIVEIS_EXPECTATIVA.map(function(k) { return '<option value="' + k + '"' + (mp.nivelExpectativa === k ? ' selected' : '') + '>' + _motorLabel(k) + '</option>'; }).join('') +
      '</select></div>' +
      '<div><label class="lbl">Complexidade do Evento</label><select class="inp" onchange="motorSetParam(\'' + orc.id + '\',\'complexidade\',this.value)">' +
        MOTOR_NIVEIS_COMPLEXIDADE.map(function(k) { return '<option value="' + k + '"' + (mp.complexidade === k ? ' selected' : '') + '>' + _motorLabel(k) + '</option>'; }).join('') +
      '</select></div>' +
      '<div><label class="lbl">Margem de Lucro (%)</label><input type="number" step="1" min="0" class="inp" style="width:90px" value="' + mp.margemLucro + '" onchange="motorSetParam(\'' + orc.id + '\',\'margemLucro\',parseFloat(this.value)||0)"></div>' +
      '<div><label class="lbl">Alíquota de Imposto (%)</label><input type="number" step="1" min="0" class="inp" style="width:90px" value="' + mp.aliquotaImposto + '" onchange="motorSetParam(\'' + orc.id + '\',\'aliquotaImposto\',parseFloat(this.value)||0)"></div>' +
    '</div>' +
  '</div>';

  var itensHtml = '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">🧾 Itens do Catálogo</div>' +
    Object.keys(porCat).sort().map(function(cat) {
      return '<div style="margin-bottom:12px">' +
        '<div style="font-size:9px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.6px;border-bottom:1px solid var(--border2);padding-bottom:4px;margin-bottom:6px">' + cat + '</div>' +
        porCat[cat].map(function(item) {
          var sel = orc.motorItens.find(function(mi) { return mi.itemId === item.id; });
          var checked = !!sel;
          var manualInput = (checked && item.tipoRegra === 'manual')
            ? '<input type="number" min="0" style="width:70px;text-align:center;font-size:11px;padding:3px 5px;background:var(--bg3);border:1px solid var(--border2);border-radius:4px;color:var(--text);font-family:var(--mono)" value="' + (sel.qtdManualOverride != null ? sel.qtdManualOverride : '') + '" placeholder="qtd" onchange="motorSetQtdManual(\'' + orc.id + '\',\'' + item.id + '\',this.value)">'
            : '';
          return '<label style="display:flex;align-items:center;gap:8px;padding:5px 4px;font-size:12px;cursor:pointer">' +
            '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="motorToggleItem(\'' + orc.id + '\',\'' + item.id + '\',this.checked)">' +
            '<span style="flex:1;color:var(--text)">' + item.nome + '</span>' +
            '<span style="font-size:9px;color:var(--text3)">' + _motorRegraLabel(item.tipoRegra) + '</span>' +
            manualInput +
          '</label>';
        }).join('');
    }).join('') +
  '</div>';

  var resultado = motorCalcular(orc);
  var resumoHtml = '<div style="background:var(--bg2);border:1px solid var(--border);border-left:3px solid #8B5CF6;border-radius:var(--radius);padding:16px">' +
    '<div style="font-size:11px;font-weight:700;color:#8B5CF6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px">📊 Resumo do Motor</div>' +
    '<div style="display:grid;grid-template-columns:1fr auto;gap:6px 16px;font-size:13px">' +
      '<span style="color:var(--text3)">Custo Presente</span><span style="text-align:right;font-family:var(--mono);color:var(--text)">' + fR(resultado.custoPresente) + '</span>' +
      '<span style="color:var(--text3)">Margem de Segurança</span><span style="text-align:right;font-family:var(--mono);color:var(--text)">' + (resultado.margemSeguranca * 100).toFixed(0) + '%</span>' +
      '<span style="color:var(--text3)">Custo Estimado</span><span style="text-align:right;font-family:var(--mono);color:var(--text)">' + fR(resultado.custoEstimado) + '</span>' +
      '<span style="color:var(--text3)">Lucro</span><span style="text-align:right;font-family:var(--mono);color:var(--text)">' + fR(resultado.lucro) + '</span>' +
      '<span style="font-weight:700;color:var(--text)">Valor Total</span><span style="text-align:right;font-family:var(--mono);font-weight:700;color:#8B5CF6">' + fR(resultado.valorTotal) + '</span>' +
      '<span style="color:var(--text3)">Valor por Pessoa</span><span style="text-align:right;font-family:var(--mono);color:var(--text)">' + fR(resultado.valorPorPessoa) + '</span>' +
    '</div>' +
    '<div style="margin-top:10px;font-size:9px;color:var(--text3)">meses: ' + resultado.debug.meses + ' · fator matriz: ' + resultado.debug.fatorMatriz + ' · fator valor: ' + resultado.debug.fatorValor + ' · fator complexidade: ' + resultado.debug.fatorComplexidade + '</div>' +
  '</div>';

  el.innerHTML = paramsHtml + itensHtml + resumoHtml;
}

// CALC_LOCAIS (orcCalc.js) tem 7 chaves e não inclui o "Viagem" genérico da planilha
// original — mapeamento só para sugerir um valor inicial ao abrir a aba pela 1ª vez.
function _motorMapCalcLocalParaMotor(calcLocalKey) {
  var mapa = {
    area_central:'area_central', jardim_canada:'jardim_canada', reg_metro:'reg_metropolitana',
    viagem_60:'viagem_60_100', viagem_100:'viagem_100_200', viagem_200:'viagem_200_300', viagem_300:'viagem_300_400',
  };
  return mapa[calcLocalKey] || MOTOR_LOCAIS[0].key;
}

function motorSetParam(orcId, campo, valor) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc || !orc.motorParams) return;
  orc.motorParams[campo] = valor;
  sv('orcamentos');
  rOrcMotor(orc);
}

function motorToggleItem(orcId, itemId, checked) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc) return;
  if (!orc.motorItens) orc.motorItens = [];
  if (checked) {
    if (!orc.motorItens.find(function(mi) { return mi.itemId === itemId; })) {
      orc.motorItens.push({ itemId: itemId, qtdManualOverride: null });
    }
  } else {
    orc.motorItens = orc.motorItens.filter(function(mi) { return mi.itemId !== itemId; });
  }
  sv('orcamentos');
  rOrcMotor(orc);
}

function motorSetQtdManual(orcId, itemId, valor) {
  var orc = (D.orcamentos || []).find(function(o) { return o.id === orcId; });
  if (!orc || !orc.motorItens) return;
  var mi = orc.motorItens.find(function(m) { return m.itemId === itemId; });
  if (!mi) return;
  mi.qtdManualOverride = valor === '' ? null : (parseFloat(valor) || 0);
  sv('orcamentos');
  rOrcMotor(orc);
}
