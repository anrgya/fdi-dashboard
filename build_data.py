import csv
import json
import os

def read_csv(filename):
    data = []
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            data.append(row)
    return data

def main():
    base_dir = r"d:\UNAIR\Offstat"
    files = {
        'pma': 'dataset_pma_2016_2023.csv',
        'pdrb': 'dataset_pdrb_2016_2023.csv',
        'miskin': 'dataset_miskin_2016_2023.csv',
        'tpt': 'dataset_tpt_2016_2023.csv'
    }
    
    datasets = {}
    for key, file in files.items():
        path = os.path.join(base_dir, file)
        if os.path.exists(path):
            datasets[key] = read_csv(path)
        else:
            print(f"Warning: {path} not found.")
            datasets[key] = []
            
    output_js = os.path.join(base_dir, 'fdi-dashboard', 'data.js')
    with open(output_js, 'w', encoding='utf-8') as f:
        f.write("const rawData = ")
        f.write(json.dumps(datasets, indent=2))
        f.write(";\n")
        
    print(f"Successfully generated {output_js}")

if __name__ == "__main__":
    main()
