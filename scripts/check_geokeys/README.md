# Geokey checker

## Tabella dei Contenuti
- [Descrizione](#descrizione)
- [Installazione](#installazione)
- [Utilizzo](#utilizzo)
- [Funzionalità](#funzionalità)

## Descrizione
Questo script permette di verificare le geokey (CAP e stati esteri) presenti in `Gokey_vN.csv`. I dati geografici provengono dai JSONL DynamoDB che popolano il database di pn-addressManager.


## Installazione
- Node.js (v16 o successiva)
- Installare le dipendenze

  ```
  npm install
  ```

## Utilizzo

Lo script richiede che vengano forniti 4 parametri tramite linea di comando:

1. `currentDateTime`: Data e ora per il filtro di validità in pn-addressManager, in formato UTC.
2. `pnAddressManagerCapUrl` URL dei CAP in formato JSONL DynamoDB `pn-addressManager-Cap.json`.
3. `pnAddressManagerCountryUrl` URL degli stati esteri in formato JSONL DynamoDB `pn-addressManager-Country.json`.
4. `geokeyCsvFile` Percorso del file `Gokey_vN.csv`.

### Esempio

```
node index.js "2024-09-09T00:00:00.000Z" "https://raw.githubusercontent.com/pagopa/xxx/confinfo/dynamodb/pn-addressManager-Cap.json" "https://raw.githubusercontent.com/pagopa/xxx/confinfo/dynamodb/pn-addressManager-Country.json" "../../dev/20240917/Geokey_v1.csv"');
```

## Funzionalità

1. Scarica i dati JSONL dai due URL forniti.
2. Deserializza i dati JSON DynamoDB.
3. Filtra i record validi in base alla data di validità e al timestamp fornito.
4. Legge i record dal file `Gokey_vN.csv`.
5. Confronta i set di dati e identifica le discrepanze tra i valori presenti solo in uno dei due set.
