#!/bin/bash

if [ -z "$1" ] ; then
  echo "Error: expected to be called with a configuration file"
  exit 1
fi

export SCRIPT_DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# load config
source "$1"

# get TLS resources
if [ -f "${CLIENT_CERT}" ] && [ -f "${CLIENT_KEY}" ] ; then
  export CLIENT_CERT=`cat "${CLIENT_CERT}" || echo ""`
  export CLIENT_KEY=`cat "${CLIENT_KEY}" || echo ""`
fi

# get an auth token
export TOKEN=`curl -fsS \
    -d "client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&username=${USER_NAME}&password=${PASSWORD}&grant_type=password" \
    "${TARGET_SSO}" | jq -r '.access_token'`

NUM_THREADS=${NUM_THREADS:-1}
THREAD_DELAY=${THREAD_DELAY:-5}
if [ ${NUM_THREADS} -gt 1 ] ; then
  for i in $(seq 1 1 ${NUM_THREADS} ) ; do
    artillery run -qo "./output/result-${i}.json" "${SCRIPT_DIR}/high-load.yml" &
    sleep ${THREAD_DELAY}
  done
else
  artillery run -o "./output/result.json" "${SCRIPT_DIR}/high-load.yml"
fi
