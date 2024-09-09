import boto3
import json
import requests
import csv
from boto3.dynamodb.types import TypeDeserializer
from datetime import datetime, timezone

current_date_time = "2024-09-09T00:00:00.000Z"
pn_address_manager_cap_url = "https://raw.githubusercontent.com/pagopa/xxx"
pn_address_manager_country_url = "https://raw.githubusercontent.com/pagopa/xxx"
geokey_csv_file = './Geokey_v1.csv'

def unmarshal_dynamodb(item):
    deserializer = TypeDeserializer()
    unmarshaled_item = {}
    
    for key, value in item.items():
        unmarshaled_item[key] = deserializer.deserialize(value)
    
    return unmarshaled_item

def read_jsonl(input_res):
    data = []    
    for line in input_res:
        marshaled_item = json.loads(line)
        unmarshaled_item = unmarshal_dynamodb(marshaled_item)
        data.append(unmarshaled_item)
    return data

def filter_valid_records(data_list, timestamp, attribute_name):
    valid = set()
    for entry in data_list:
        start_validity = entry['startValidity']
        if start_validity:
            start_validity_date = datetime.strptime(start_validity, '%Y-%m-%dT%H:%M:%S.%f000').replace(tzinfo=timezone.utc)
            # Check timestamp
            if timestamp < start_validity_date:
                pass
        valid.add(entry[attribute_name])
    return valid

def read_csv(file_path, column_name):
    values = set()
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=';')
        for row in reader:
            value = row.get(column_name)
            values.add(value)
    return values

def compare_sets(set1, set2):
    only_in_set1 = set1 - set2
    only_in_set2 = set2 - set1
    return only_in_set1, only_in_set2

# Get DynamoDB 
cap = requests.get(pn_address_manager_cap_url)
country = requests.get(pn_address_manager_country_url)

# Deserialize jsonl
cap_data = read_jsonl(cap.iter_lines())
country_data = read_jsonl(country.iter_lines())

current_date_time = datetime.fromisoformat(current_date_time.replace('Z', '+00:00'))


# Filter valid caps
valid_caps = filter_valid_records(cap_data, current_date_time, 'cap')
valid_countries = filter_valid_records(country_data, current_date_time, 'country')

valid_geokeys = valid_caps.union(valid_countries)
geokey_file_set = read_csv(geokey_csv_file, 'geokey')

only_valid, only_geokey_file = compare_sets(valid_geokeys, geokey_file_set)

print(f"Presenti solo in pn-addressManager:")
print(only_valid)

print(f"\nPresenti solo in {geokey_csv_file}:")
print(only_geokey_file)