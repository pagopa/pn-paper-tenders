#!/bin/bash
# Crea o aggiorna lo stack dell'allarme pn-paper-channel-CheckTender.
# Il timestamp di attivazione della gara è in UTC e viene convertito in epoch (secondi).

set -euo pipefail

usage() {
    {
        echo "Uso: $0 <profile> <tenderId> <timestamp_attivazione_utc> [region]"
        echo "  tenderId nel formato YYYYMMDD"
        echo "  timestamp nel formato YYYY-MM-DDTHH:MM:SSZ o YYYY-MM-DDTHH:MM:SS.sssZ (UTC, 'Z' finale obbligatoria)"
        echo "Esempio: $0 sso_pn-core-dev 20260921 2026-09-20T22:15:00Z"
    } >&2
    exit 1
}

if [ "$#" -lt 3 ] || [ "$#" -gt 4 ]; then
    usage
fi

PROFILE=$1
TENDER_ID=$2
ACTIVATION_UTC=$3
REGION=${4:-eu-south-1}

STACK_NAME="pn-paper-channel-CheckTender-alarm"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/pn-paper-channel-CheckTender-alarm.yaml"

# Il tenderId finisce nella regex del metric filter: ammessi solo id di gara YYYYMMDD
if ! [[ "$TENDER_ID" =~ ^[0-9]{8}$ ]]; then
    echo "tenderId non valido: '$TENDER_ID'" >&2
    usage
fi

if ! [[ "$ACTIVATION_UTC" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?Z$ ]]; then
    echo "Timestamp non valido: $ACTIVATION_UTC" >&2
    usage
fi

# Normalizza: 2026-09-20T22:15:00.000Z -> 2026-09-20 22:15:00 (i millisecondi vengono scartati)
NORMALIZED=${ACTIVATION_UTC%Z}
NORMALIZED=${NORMALIZED%.*}
NORMALIZED=${NORMALIZED/T/ }

# GNU date (Linux) oppure BSD date (macOS)
if date --version >/dev/null 2>&1; then
    to_epoch() { date -u -d "$1" +%s; }
    from_epoch() { date -u -d "@$1" '+%Y-%m-%d %H:%M:%S'; }
else
    to_epoch() { date -u -j -f "%Y-%m-%d %H:%M:%S" "$1" +%s; }
    from_epoch() { date -u -r "$1" '+%Y-%m-%d %H:%M:%S'; }
fi

if ! ACTIVATION_EPOCH=$(to_epoch "$NORMALIZED" 2>/dev/null); then
    echo "Timestamp non valido: $ACTIVATION_UTC" >&2
    usage
fi

# BSD date accetta date inesistenti spostandole (2026-02-30 -> 2026-03-02): la riconversione deve coincidere
if [ "$(from_epoch "$ACTIVATION_EPOCH")" != "$NORMALIZED" ]; then
    echo "Data inesistente: $ACTIVATION_UTC" >&2
    usage
fi

# Stato attuale dello stack, se esiste; qualunque altro errore (es. sessione SSO scaduta) interrompe lo script
if ! CURRENT=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].[Parameters[?ParameterKey==`tenderId`].ParameterValue | [0], Parameters[?ParameterKey==`tenderActivationEpoch`].ParameterValue | [0]]' \
    --output text \
    --profile "$PROFILE" \
    --region "$REGION" 2>&1); then
    if [[ "$CURRENT" == *"does not exist"* ]]; then
        CURRENT=""
    else
        echo "Errore nel leggere lo stack: $CURRENT" >&2
        exit 1
    fi
fi

echo "Stack:       $STACK_NAME ($PROFILE, $REGION)"
if [ -n "$CURRENT" ]; then
    read -r CURRENT_TENDER_ID CURRENT_EPOCH <<< "$CURRENT"
    echo "Attuale:     tenderId $CURRENT_TENDER_ID, attivazione $(from_epoch "$CURRENT_EPOCH") UTC (epoch $CURRENT_EPOCH)"
else
    echo "Attuale:     stack non presente, verrà creato"
fi
echo "Nuovo:       tenderId $TENDER_ID, attivazione $NORMALIZED UTC (epoch $ACTIVATION_EPOCH)"

if [ "$ACTIVATION_EPOCH" -lt "$(date +%s)" ]; then
    echo "ATTENZIONE: l'attivazione è nel passato, l'allarme valuterà subito la nuova gara" >&2
fi

if [[ "$PROFILE" == *prod* ]]; then
    echo "ATTENZIONE: profilo di PRODUZIONE" >&2
fi

read -r -p "Procedere con il deploy? [y/N] " CONFIRM
if ! [[ "$CONFIRM" =~ ^[yY]$ ]]; then
    echo "Annullato"
    exit 1
fi

# deploy crea lo stack se non esiste, altrimenti lo aggiorna
aws cloudformation deploy \
    --stack-name "$STACK_NAME" \
    --template-file "$TEMPLATE_FILE" \
    --parameter-overrides "tenderId=$TENDER_ID" "tenderActivationEpoch=$ACTIVATION_EPOCH" \
    --no-fail-on-empty-changeset \
    --profile "$PROFILE" \
    --region "$REGION"

aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].StackStatus' \
    --output text \
    --profile "$PROFILE" \
    --region "$REGION"
