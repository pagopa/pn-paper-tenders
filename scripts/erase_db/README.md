# Erase DynamoDB tables

## Tabella dei Contenuti
- [Descrizione](#descrizione)
- [Installazione](#installazione)
- [Utilizzo](#utilizzo)

## Descrizione
Questo script consente di eliminare tutti gli elementi (o solo una gara) dalle tabelle che gestiscono le gare di pn-paper-channel. L'autenticazione avviene attraverso AWS SSO. Lo script supporta la cancellazione in batch, eliminando fino a 25 elementi per volta.

## Installazione
- Node.js (v16 o successiva)
- Installare le dipendenze

  ```
  npm install
  ```

## Utilizzo
Lo script richiede il profilo sso come argomento e l'id della gara (facoltativo):

```
Usage: node index.js <sso_profile> [tenderId]

node index.js "sso_pn-core-dev" "20250504"
```