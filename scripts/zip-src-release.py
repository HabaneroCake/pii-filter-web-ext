#!/usr/bin/env python3

import os
import json
import subprocess

DIR =           os.path.dirname(os.path.abspath(__file__))
PAR_DIR =       os.path.abspath(os.path.join(DIR, os.pardir))

MANIFEST_JSON = os.path.join(PAR_DIR, 'manifest.json')

with open(MANIFEST_JSON, 'r') as f:
    package =   json.load(f)
    name =      package['name']
    version =   package['version']
    file_name = f'src_{name}_{version}.zip'
    file_path = os.path.join(PAR_DIR, file_name)

    subprocess.check_call(['git', 'archive', '--format=zip', '--output', file_path, 'HEAD'], cwd=PAR_DIR)