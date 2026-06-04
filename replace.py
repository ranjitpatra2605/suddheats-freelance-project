import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace _id with id carefully
    # We want to replace _id when it's part of an object property (e.g. user._id -> user.id)
    # or an object key (e.g. { _id: ... } -> { id: ... })
    # or just standalone _id variable.
    
    # regex for \b_id\b doesn't work for obj._id because . is not a word character.
    # We can match (?<![a-zA-Z0-9])_id(?![a-zA-Z0-9])
    
    new_content = re.sub(r'(?<![a-zA-Z0-9])_id(?![a-zA-Z0-9])', 'id', content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

def main():
    dirs_to_check = ['backend', 'frontend']
    exclude_dirs = ['node_modules', '.next', '.git']
    
    for d in dirs_to_check:
        for root, dirs, files in os.walk(d):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if file.endswith(('.js', '.ts', '.tsx')):
                    replace_in_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
