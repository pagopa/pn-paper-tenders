#!/bin/bash
# Crea o aggiorna lo stack dell'allarme pn-paper-channel-CheckTender.
# Il timestamp di attivazione della gara è in UTC e viene convertito in epoch (secondi).

set -euo pipefail

usage() {
    echo "Uso: $0 <profile> <tenderId> <timestamp_attivazione_utc> [region]"
    echo "  timestamp nel formato YYYY-MM-DDTHH:MM:SSZ o YYYY-MM-DDTHH:MM:SS.sssZ (UTC, 'Z' finale obbligatoria)"
    echo "Esempio: $0 sso_pn-core-dev 20260921 2026-09-20T22:15:00Z"
    exit 1
}

if [ "$#" -lt 3 ] || [ "$#" -gt 4 ]; then
    usage
fi

AWS_PROFILE=$1
TENDER_ID=$2
ACTIVATION_UTC=$3
AWS_REGION=${4:-eu-south-1}

STACK_NAME="pn-paper-channel-CheckTender-alarm"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/pn-paper-channel-CheckTender-alarm.yaml"

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
    ACTIVATION_EPOCH=$(date -u -d "$NORMALIZED" +%s)
else
    ACTIVATION_EPOCH=$(date -u -j -f "%Y-%m-%d %H:%M:%S" "$NORMALIZED" +%s)
fi

echo "Stack:      $STACK_NAME ($AWS_PROFILE, $AWS_REGION)"
echo "tenderId:   $TENDER_ID"
echo "Attivazione: $NORMALIZED UTC -> epoch $ACTIVATION_EPOCH"

# deploy crea lo stack se non esiste, altrimenti lo aggiorna
aws cloudformation deploy \
    --stack-name "$STACK_NAME" \
    --template-file "$TEMPLATE_FILE" \
    --parameter-overrides "tenderId=$TENDER_ID" "tenderActivationEpoch=$ACTIVATION_EPOCH" \
    --no-fail-on-empty-changeset \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION"

aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query 'Stacks[0].StackStatus' \
    --output text \
    --profile "$AWS_PROFILE" \
    --region "$AWS_REGION"
