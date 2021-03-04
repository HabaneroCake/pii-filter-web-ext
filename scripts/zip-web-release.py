#!/usr/bin/env python3

import os
import json
import zipfile

DIR =           os.path.dirname(os.path.abspath(__file__))
PAR_DIR =       os.path.abspath(os.path.join(DIR, os.pardir))
MANIFEST_JSON = os.path.join(PAR_DIR, 'manifest.json')

file_paths = [
    os.path.join(PAR_DIR, 'assets'),
    os.path.join(PAR_DIR, 'build'),
    os.path.join(PAR_DIR, 'background.html'),
    os.path.join(PAR_DIR, 'manifest.json')
]

with open(MANIFEST_JSON, 'r') as f:
    package =   json.load(f)
    name =      package['name']
    version =   package['version']
    file_name = f'web_{name}_{version}.zip'
    file_path = os.path.join(PAR_DIR, file_name)

    with zipfile.ZipFile(file_path, 'w', zipfile.ZIP_DEFLATED) as zip_f:
        for path in file_paths:
            if os.path.isdir(path):
                for root, dirs, files in os.walk(path):
                    for file in files:
                        f_absolute_path = os.path.join(root, file)
                        zip_f.write(f_absolute_path, os.path.relpath(f_absolute_path, os.path.join(path, os.pardir)))
            else:
                zip_f.write(path, os.path.relpath(path, os.path.join(path, os.pardir)))