#!/bin/bash

if [ "$#" -ne 2 ]; then
    echo "Uso: $0 <profile1> <profile2>"
    exit 1
fi

AWS_PROFILE1=$1
AWS_PROFILE2=$2

TABLES=(
    'pn-PaperChannelTender'
    'pn-PaperChannelGeokey'
    'pn-PaperChannelDeliveryDriver'
    'pn-PaperChannelCost'
)

OUTPUT_DIR="./tmp/dynamodb_dumps"
mkdir -p "$OUTPUT_DIR"

dump_tables() {
    local PROFILE=$1
    local PROFILE_DIR="$OUTPUT_DIR/$PROFILE"
    mkdir -p "$PROFILE_DIR"

    for TABLE in "${TABLES[@]}"; do
        OUTPUT_FILE="$PROFILE_DIR/${TABLE}.json"
        echo "Eseguendo il dump della tabella $TABLE per il profilo $PROFILE in $OUTPUT_FILE..."
        aws dynamodb scan --table-name "$TABLE" --output json --profile "$PROFILE" > "$OUTPUT_FILE"
        if [ $? -eq 0 ]; then
            echo "Dump della tabella $TABLE per il profilo $PROFILE completato con successo."
        else
            echo "Errore durante il dump della tabella $TABLE per il profilo $PROFILE." >&2
        fi
    done
}

diff_tables() {
    local PROFILE1=$1
    local PROFILE2=$2
    local DIFF_DIR="$OUTPUT_DIR/diffs"
    mkdir -p "$DIFF_DIR"

    for TABLE in "${TABLES[@]}"; do
        FILE1="$OUTPUT_DIR/$PROFILE1/${TABLE}.json"
        FILE2="$OUTPUT_DIR/$PROFILE2/${TABLE}.json"
        DIFF_FILE="$DIFF_DIR/${TABLE}_diff.txt"

        echo "Confrontando la tabella $TABLE tra i profili $PROFILE1 e $PROFILE2..."
        if [ -f "$FILE1" ] && [ -f "$FILE2" ]; then
            # Removes createdAt attributes from objects in Items
            jq '.Items | map(del(.createdAt)) | sort_by(.)' "$FILE1" > "$OUTPUT_DIR/file1_cleaned.json"
            jq '.Items | map(del(.createdAt)) | sort_by(.)' "$FILE2" > "$OUTPUT_DIR/file2_cleaned.json"

            # Diff cleaned files
            diff "$OUTPUT_DIR/file1_cleaned.json" "$OUTPUT_DIR/file2_cleaned.json" > "$DIFF_FILE"
            
            if [ -s "$DIFF_FILE" ]; then
                echo "Differenze trovate per la tabella $TABLE. Salvate in $DIFF_FILE."
            else
                echo "Nessuna differenza per la tabella $TABLE."
                rm "$DIFF_FILE"
            fi
            rm /tmp/file1_cleaned.json /tmp/file2_cleaned.json
        else
            echo "Uno o entrambi i file per la tabella $TABLE non esistono."
        fi
    done
}


dump_tables "$AWS_PROFILE1"
dump_tables "$AWS_PROFILE2"
diff_tables "$AWS_PROFILE1" "$AWS_PROFILE2"

echo "Operazioni completate. I risultati sono salvati in $OUTPUT_DIR."
