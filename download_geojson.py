import urllib.request
import json
import os

urls = [
    "https://raw.githubusercontent.com/yusufsyaifudin/wilayah-indonesia/master/data/list_of_area/indonesia-provinces.geojson",
    "https://raw.githubusercontent.com/fahmi-arff/indonesia-geojson/master/provinsi.json",
    "https://raw.githubusercontent.com/Vizzuality/growasia_calculator/master/public/indonesia.geojson",
    "https://raw.githubusercontent.com/codesphere-cloud/geojson-maps/main/indonesia-provinces.geojson",
]

output_path = os.path.join(os.path.dirname(__file__), "indonesia.geojson")

for url in urls:
    try:
        print(f"\nTrying: {url}")
        urllib.request.urlretrieve(url, output_path)
        with open(output_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if data.get('type') in ('FeatureCollection', 'Topology'):
            features = data.get('features', [])
            print(f"Success! {len(features)} features loaded.")
            if features:
                props = features[0].get('properties', {})
                print(f"Property keys: {list(props.keys())}")
                # Print all province names
                name_key = None
                for k in ['name', 'NAME_1', 'Propinsi', 'provinsi', 'state', 'PROVINSI']:
                    if k in props:
                        name_key = k
                        break
                if name_key:
                    print(f"\nUsing key: '{name_key}'")
                    for f2 in data['features']:
                        print(f"  {f2['properties'].get(name_key, '???')}")
                else:
                    print(f"All properties of first feature: {json.dumps(props, indent=2)}")
            break
        else:
            print(f"Unexpected type: {data.get('type')}")
    except Exception as e:
        print(f"Failed: {e}")
else:
    print("\nAll URLs failed. Keeping existing geojson.")
