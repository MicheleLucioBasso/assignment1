// dichiarazione variabili globali
let table; //per memorizzare dati caricati dal file CSV
let filteredRows = []; //per righe che soddisfano condizione (column0 > 0 and column2 < 0)
let stats = {}; //oggetto per memorizzare risultati statistiche
let dataLoaded = false; //per assicurarsi che dati e calcoli siano pronti

// FUNZIONI STATISTICHE
function calculateMean(arr) { //calculateMean(arr) è funzione che calcola media dell'array di numeri arr (quelli della column0 filtrata)
  if (arr.length === 0) return 0; // se array è vuoto (length = 0), funzione restituisce 0 per evitare divisioni per zero nel calcolo successivo
  const sum = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0); //arr.reduce() riduce ogni elemento dell'array a 1 singolo valore e li somma,
                                                                                        //accumulator è somma parziale accumulata finora, currentValue è elemento corrente dell'array
                                                                                        //0 è valore iniziale dell'accumulator, che dunque inizia da 0
  return sum / arr.length; //funzione return restituisce media, calcolata dividendo sum (appena calcolata) per numero elementi nell'array (arr.length)
}

function calculateStandardDeviation(arr) { //calculateStandardDeviation(arr) è funzione che calcola deviazione standard array di numeri arr (quelli della column1 filtrata)
                                           //deviazione Standard in matematica: calcola prima media del campione. Quindi, per ogni valore di dati, trova differenza tra il valore e media del campione. Poi, eleva al quadrato queste differenze e le somma
  if (arr.length < 2) return 0; //se array (arr) contiene meno di due elementi, funzione restituisce 0, poiché calcolo deviazione standard richiede divisione per n-1 (n è numero di elementi), se n = 0 o 1, la divisione per zero o numero negativo non è definita per una stima affidabile
  const mean = calculateMean(arr); //chiama funzione calculateMean(arr), per ottenere media aritmetica di tutti numeri nell'array arr (column1 filtrata)
  //calcola somma dei quadrati delle differenze dalla media
  const varianceSum = arr.reduce((sum, val) => sum + pow(val - mean, 2), 0); //reduce() itera sull'array e accumula un unico valore (sum)
                                                                             //pow(val - mean, 2) calcola la differenza di ogni valore meno la media ed eleva il risultato al quadrato2
                                                                             //sum + pow(val - mean, 2) somma lo scarto quadrato calcolato in pow(val - mean, 2) alla somma totale accumulata (sum)
                                                                             //il risultato è la somma degli scarti quadratici
  //calcolo finale Deviazione Standard (radice quadrata della varianza campionaria, divisa per n-1)
  //varianza campionaria è quadrato della deviazione standard campionaria, misura quanto dati sono dispersi rispetto alla media, ma in unità "al quadrato"
  return sqrt(varianceSum / (arr.length - 1)); //Deviazione Standard è radice quadrata della varianza campionaria
}

function calculateMode(arr) { //calculateMode(arr) è funzione che calcola moda array di numeri arr (quelli della column2 filtrata)
  if (arr.length === 0) return undefined; //se array è vuoto (length = 0), moda non esiste, quindi funzione restituisce undefined
  const counts = {}; //crea oggetto vuoto "counts", per memorizzare frequenza di ciascun numero, valore sarà quante volte quel numero compare nell'array
  let maxCount = 0; //inizializza una variabile per tenere traccia della frequenza più alta trovata finora
  let mode; //inizializza variabile che conterrà numero di moda

  for (const num of arr) { //inizia ciclo for per iterare su ogni numero (num) nell'array arr (numeri della column2 filtrata)
    counts[num] = (counts[num] || 0) + 1; //aggiorna conteggio del numero corrente
    if (counts[num] > maxCount) { //verifica se nuovo conteggio è > maxCount (frequenza massima registrata finora)
      maxCount = counts[num]; //se conteggio è >, aggiorna maxCount con questa nuova frequenza
      mode = num; //aggiorna variabile mode con numero corrente (num), poiché questo è ora elemento più frequente, di moda
    }
  }
  return mode; //a termine ciclo, funzione restituisce numero memorizzato in mode, la moda
}

function calculateMedian(arr) { //calculateMedian(arr) è funzione che calcola mediana array di numeri arr (quelli della column3 filtrata)
  if (arr.length === 0) return undefined; //se array è vuoto (length = 0), mediana non può essere calcolata, quindi restituisce undefined
  const sorted = [...arr].sort((a, b) => a - b); //crea una copia e la ordina in modo ascendente, perché metodo .sort() modifica array in loco. Copiandolo, si evita di alterare array arr originale
                                                 //.sort((a, b) => a - b) ordina numeri della copia in ordine ascendente (da più piccolo a più grande)
  const middle = floor(sorted.length / 2); //calcola indice della metà dell'array ordinato
                                           //(sorted.length / 2) trova il punto centrale
                                           //floor() arrotonda risultato a intero più basso (es. 5.5 diventa 5, 4.0 diventa 4)

  if (sorted.length % 2 === 0) { //controlla se numero elementi è pari (resto della divisione per 2 = 0)
    return (sorted[middle - 1] + sorted[middle]) / 2; //se lunghezza è pari, mediana è media dei due elementi centrali
  } else {
    return sorted[middle]; //se invece lunghezza è dispari, mediana è elemento centrale
  }
}

function preload() {
  table = loadTable('dataset.csv', 'csv', 'header'); //carica file CSV, 'csv' specifica formato .csv, 'header' dice a p5 che tabella ha riga header (che verrà saltata per accesso ai dati)
}

function setup() {
  createCanvas(800, 2000);
  background("#000000"); //sfondo nero

  //raccolta dati
  const col0Values = []; //utilizzo nomi colonne ("column0", "column1"...) per accedere, poiché utilizzato opzione 'header' in loadTable()
  const col1Values = [];
  const col2Values = [];
  const col3Values = [];
  const col4Values = [];

  //estrazione righe che verranno filtrate secondo condizione (column0 > 0 and column2 < 0)
  for (let r = 0; r < table.getRowCount(); r++) { //ciclo for itera su tutte righe tabella, a partire dalla 1^ (let r = 0)
                                                  //ciclo continua finché r < table.getRowCount() (il numero totale di righe di dati nella tabella)
                                                  //r++ a ogni iterazione r incrementato di 1
    const row = table.getRow(r); //table.getRow(r) estrae intera riga di dati (all'indice r) come oggetto p5.TableRow (riga della tabella), che viene memorizzato nella const Row
    const column0 = row.getNum("column0"); //row.getNum("column0") recupera valore column0, getNum() recupera valore come numero per calcolo media successivo
    const column2 = row.getNum("column2"); //row.getNum("column2") recupera valore column2, getNum() recupera valore come numero per calcolo moda successivo

    if (column0 > 0 && column2 < 0) { //applicazione condizione di filtro (column0 > 0 and column2 < 0)
      filteredRows.push(row); //se riga rispetta la  condizione, aggiungila all'array filteredRows
                              //push(row) aggiunge elemento (row) a fine array
                              //l'array filteredRows conterrà solo righe tabella che rispettano la condizione
      //valori numerici per colonne da analizzare
      col0Values.push(column0); //aggiunge (push) elemento numerico già estratto sopra (column0) a fine array (col0Values)
                                //array col0Values sarà utilizzato per calcolo media column0
      col1Values.push(row.getNum("column1")); //row.getNum("column1") recupera valore column1, getNum() recupera valore come numero per calcolo deviazione standard successivo
                                              //aggiunge (push) elemento numerico appena estratto (column1) a fine array (col1Values)
      col2Values.push(column2); //aggiunge (push) elemento numerico già estratto sopra (column2) a fine array (col2Values)
                                //array col2Values sarà utilizzato per calcolo moda column2
      col3Values.push(row.getNum("column3")); //row.getNum("column3") recupera valore column3, getNum() recupera valore come numero per calcolo mediana successivo
                                              //aggiunge (push) elemento numerico appena estratto (column3) a fine array (col3Values)
      col4Values.push(row.getNum("column4")); //row.getNum("column4") recupera valore column4, getNum() recupera valore come numero per calcolo media e deviazione standard successivi
                                              //aggiunge (push) elemento numerico appena estratto (column4) a fine array (col4Values)
    }
  }

  //calcolo statistiche
  //tutte righe assegnano risultato del calcolo a oggetto stats
  //let stats = {}; è variabile globale dichiarata a inizio
  stats.mean0 = calculateMean(col0Values); //calcola media valori colonna0
  stats.stdDev1 = calculateStandardDeviation(col1Values); //calcola deviazione standard valori colonna1
  stats.mode2 = calculateMode(col2Values); //calcola moda valori colonna2
  stats.median3 = calculateMedian(col3Values); //calcola mediana valori colonna3
  stats.mean4 = calculateMean(col4Values); //calcola media valori colonna4
  stats.stdDev4 = calculateStandardDeviation(col4Values); //calcola deviazione standard valori colonna4

  dataLoaded = true; //let stats = {}; dichiarata come false a inizio codice, per assicurarsi che dati e calcoli siano pronti, ora è true, poiché calcoli pronti
}

function draw() {
  //posizionamento iniziale sull'asse Y
  let currentY = 50; //garantisce che elementi vengano visualizzati uno sotto altro senza sovrapporsi

  push();

  textAlign(CENTER);
  textSize(24);
  fill("#ffffffff");
  noStroke();
  text("Statistica dati filtrati (column0 > 0 and column2 < 0)", width / 2, currentY);
  currentY += 40; //aumenta variabile currentY di 40 pixel, così lascia 40px sotto titolo

  pop();

  //linea di separazione
  push();

  stroke(200);
  line(0, currentY, width, currentY);
  currentY += 20; //aumenta variabile currentY di 20 pixel, così lascia 20px sotto linea di separazione

  pop();

  push();

  textAlign(CENTER, CENTER);
  fill("#0095ffff");
  noStroke();

  const circleDiameter = map(stats.mean0, 0, 100, 50, 200); //funzione map() di p5 converte un numero da un intervallo a un altro, assicura che cerchio abbia dimensione visibile, proporzionale al dato
                                                            //stats.mean0 è valore media calcolato
                                                            //primi 3 numeri impostano valore originale a valore di stats.mean0, e intervallo che lo comprende tra 0 e 100
                                                            //ultimi 2 numeri impostano intervallo tra 50 e 200, proporzionalmente
  const circleX = width / 2;
  const circleY = currentY + circleDiameter / 2 + 30;

  circle(circleX, circleY, circleDiameter);

  fill("#ffffffff");
  textSize(16);
  text(stats.mean0.toFixed(2), circleX, circleY); //numero calcolato media column0

  fill("#ffffffff");
  textSize(18);
  text("Media column0", circleX, currentY);

  currentY = circleY + circleDiameter / 2 + 50;
  
  pop();

  //linea di separazione
  push();

  stroke(200);
  line(0, currentY, width, currentY);
  currentY += 20; //aumenta variabile currentY di 20 pixel, così lascia 20px sotto linea di separazione

  pop();

  push();

  textAlign(CENTER, TOP);
  fill("#ffffffff");
  noStroke();
  textSize(18);
  text(`Moda column2: ${stats.mode2.toFixed(2)}`, width / 2, currentY); //${stats.mode2.toFixed(2)} valore moda calcolata column2 (che si trova nella variabile globale stats)
                                                                        //toFixed(2) indica che valore numerico deve essere formattato come stringa con 2 cifre decimali
  currentY += 30; //aumenta variabile currentY di 30 pixel, così lascia 30px sotto titolo

  const ellipseCenterY = currentY + 70;
  const ellipseHeight = 100;
  const modeVal = stats.mode2; //stats.mode2 è valore moda calcolata column2 (che si trova nella variabile globale stats)

  //5 ellissi verticali, 1 per ogni column
  for (let i = 0; i < 5; i++) { //ciclo for si ripete 5 volte (per i = 0, 1, 2, 3, 4), finché i < 5, i aumenta di 1 (i++)
    const x = width / 2 - 100 + i * 50; //- 100 sposta punto di partenza a sinistra di 100px dal centro, per tenere ellissi centrate
                                        //+ i * 50 è per spaziatura, a ogni iterazione coordinata X spostata di 50 pixel a destra
    ellipse(x, ellipseCenterY, 15, ellipseHeight);
  }

  //funzione map() di p5 converte un numero da un intervallo a un altro, proporzionale al dato
  //modeVal è valore moda calcolato
  //primi 3 numeri impostano valore originale a valore di modeVal, e intervallo che lo comprende tra -100 e 0
  //ultimi 2 numeri impostano intervallo tra 50 e 200, proporzionalmente
  const mappedModeY = map(modeVal, -100, 0, ellipseCenterY + ellipseHeight / 2, ellipseCenterY - ellipseHeight / 2);

  strokeWeight(2);
  stroke("#ff0000ff"); //riga rossa spessa
  line(width / 2 - 150, mappedModeY, width / 2 + 150, mappedModeY); //line(x1, y1, x2, y2)

  currentY = ellipseCenterY + ellipseHeight / 2 + 50;

  fill("#ffffffff");
  noStroke();
  textSize(18);
  text('100', width / 2 - 130, mappedModeY - 100);

  fill("#ffffffff");
  noStroke();
  textSize(18);
  text('0', width / 2 - 130, mappedModeY - 50);

  fill("#ffffffff");
  noStroke();
  textSize(18);
  text('-100', width / 2 - 130, mappedModeY - 12);

  pop();

  //linea di separazione
  push();

  stroke(200);
  line(0, currentY, width, currentY);
  currentY += 20;

  pop();

  push();

  fill("#fbff00ff"); //giallo
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text(`Deviazione standard column1: ${stats.stdDev1.toFixed(2)}`, 50, currentY); //${stats.stdDev1.toFixed(2)} valore deviazione standard calcolata column1 (che si trova nella variabile globale stats)
                                                                                  //toFixed(2) indica che valore numerico deve essere formattato come stringa con 2 cifre decimali
  currentY += 50; //aumenta variabile currentY di 50 pixel, così lascia 50px sotto titolo
  pop();

  // Linea di separazione
  stroke(200);
  line(0, currentY, width, currentY);
  currentY += 20; //aumenta variabile currentY di 20 pixel, così lascia 20px sotto linea di separazione

  push();

  fill("#ff00a2ff"); // rosa
  noStroke();
  textSize(20);
  textAlign(LEFT, TOP);
  text(`Mediana column3: ${stats.median3.toFixed(2)}`, 50, currentY); //${stats.median3.toFixed(2)} valore mediana calcolata column3 (che si trova nella variabile globale stats)
                                                                      //toFixed(2) indica che valore numerico deve essere formattato come stringa con 2 cifre decimali
  currentY += 40; //aumenta variabile currentY di 40 pixel, così lascia 40px sotto titolo
  
  pop();

  //linea di separazione
  stroke(200);
  line(0, currentY, width, currentY);
  currentY += 20; //aumenta variabile currentY di 20 pixel, così lascia 20px sotto linea di separazione

  push();

  textAlign(CENTER, TOP);
  textSize(18);
  fill("#ffffffff");
  noStroke();
  text(`Statistiche column4 (istogramma):`, width / 2, currentY);
  currentY += 30; //aumenta variabile currentY di 30 pixel, così lascia 30px sotto titolo

  const barWidth = 120; //larghezza barre istogramma
  const chartY = currentY + 70; //base istogramma
  const chartXStart = width / 2 - barWidth;

  //asse X
  push();

  fill("#ffffffff");
  stroke(200);
  line(chartXStart - 20, chartY + 1, chartXStart + barWidth * 2 + 20, chartY + 1);

  pop();

  //asse Y
  push();

  fill("#ffffffff");
  stroke(200);
  line(chartXStart, chartY + 20, chartXStart, chartY - 70);

  pop();

  //barra media
  fill("#0051ffff"); //blu
  const meanHeight = stats.mean4;
  rect(chartXStart, chartY - meanHeight, barWidth, meanHeight + 1);

  fill("#0051ffff");
  textSize(14);
  text(`Media: ${stats.mean4.toFixed(2)}`, chartXStart + barWidth / 2, chartY + 15); //${stats.mean4.toFixed(2)} valore media calcolata column4 (che si trova nella variabile globale stats)
                                                                                     //toFixed(2) indica che valore numerico deve essere formattato come stringa con 2 cifre decimali

  //barra deviazione standard
  fill("#00ff26ff"); //verde
  const stdDevHeight = stats.stdDev4;
  rect(chartXStart + barWidth, chartY - stdDevHeight, barWidth, stdDevHeight);

  fill("#00ff26ff");
  text(`Std dev: ${stats.stdDev4.toFixed(2)}`, chartXStart + barWidth + barWidth / 2, chartY + 15); //${stats.stdDev4.toFixed(2)} valore deviazione standard calcolata column4 (che si trova nella variabile globale stats)
                                                                                                    //toFixed(2) indica che valore numerico deve essere formattato come stringa con 2 cifre decimali
  
  pop();
}