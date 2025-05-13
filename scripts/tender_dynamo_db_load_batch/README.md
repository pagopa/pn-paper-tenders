# tender_dynamo_db_load_batch

Script di inserimento batch di gare in dynamo db
## Tabella dei Contenuti

- [Descrizione](#descrizione)
- [Installazione](#installazione)
- [Utilizzo](#utilizzo)

## Descrizione

Lo Script, dato in input il puntamento S3 ad un artefatto compresso contenente elementi marshalled di dynamo, 
effettua l'inserimento a gruppi di n elementi nella relativa tabella dynamoDB.
La struttura dell'artefatto compresso è la seguente:
- pn-PaperChannelTender.json
- pn-PaperChannelCost.json
- pn-PaperChannelGeokey.json
- pn-PaperChannelDeliveryDrivers.json
- pn-PaperDeliveryDriverCapacities.json

Notiamo che ogni file json, tolta l'estensione, coincide con il nome della tabella nella quale effettuare
l'inserimento batch.

## Installazione

```bash
npm install
```

## Utilizzo

### Avvio di una session SSO

Per consentire l'utilizzo del profilo SSO e generare quindi le credenziali temporanee per accedere ai servizi AWS,
risulta necessario instaurare una sessione SSO da cli.
```bash
aws sso login --profile <profile>
```

### Preparazione dell'ambiente locale

Opzionalmente è possibile lanciare lo script interagendo con i servizi AWS in Localstack, quindi localmente.
In questo caso, occorre, preliminarmente, lanciare lo script ```localstack.sh``` al percorso
```scripts/tender_dynamo_db_load_batch/tests/localstack.sh```.

### Esecuzione
```bash
node Usage: index.js --cicdProfile <cicdProfile> --coreProfile <coreProfile> --env <env> --bucket <bucket> --artifact <artifact> [--local <local>] [--full-import <full-import>] [--local <local>]
```
Dove:
- `<cicdProfile>` è il profilo dell'account CI AWS;
- `<coreProfile>` è il profilo dell'account core AWS;
- `<env>` é l'ambiente in cui effettuare il caricamento batch;
- `<bucket>` nome del bucket S3 da cui prelevare l'artefatto;
- `<artifact>` chiave S3 che identifica l'artefatto all'interno del bucket
- `<local>` booleano non mandatorio che indica se eseguire lo script localmente tramite localstack
- `<full-import>` booleano non mandatorio che indica se eseguire l'import completo di tutte le gare