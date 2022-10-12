#!/bin/bash

set -e;

scriptDir="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )";
repoRootDir="$(dirname "$scriptDir")";


npm install;
npm run compile;
originalTarOutput="${repoRootDir}/$(npm pack 2>&1 | tail -1)";
export TAR_TO_INSTALL;
TAR_TO_INSTALL="${repoRootDir}/package.tgz";
mv "$originalTarOutput" "$TAR_TO_INSTALL";

# allow mocha to fail without exiting the script
set +e;

mocha --config "$repoRootDir"/configs/mocha.config.js "$@";
testResult=$?;

exit "$testResult";