# Build tenders

## Tabella dei Contenuti
- [Descrizione](#descrizione)
- [Installazione](#installazione)
- [Utilizzo](#utilizzo)
- [Funzionalità](#funzionalità)

## Descrizione
Questo script permette di validare la gare della repository pn-paper-tenders e di generare il relativi JSONL DynamoDB.


## Installazione
- Node.js (v16 o successiva)
- Installare le dipendenze

  ```
  npm install
  ```

## Utilizzo

  ```
  npm run start
  ```

## Funzionalità

1. Controlla la struttura del progetto (directory e naming convention).
2. Valida ogni singolo CSV che compone la gara.
3. Produce in output file JSONL DynamoDB pronti per essere caricati.
