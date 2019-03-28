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
  for i in {1..${NUM_THREADS}} ; do
    artillery run "${SCRIPT_DIR}/high-load.yml" > "./result-${i}.log" 2>&1 &
    sleep ${THREAD_DELAY}
  done
else
  artillery run "${SCRIPT_DIR}/high-load.yml" > "./result.log" 2>&1 &
fi
