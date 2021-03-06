# lev-api-stress
Stress testing for the [LEV API], based on the [Artillery.io] tool.


## Running the test
The performance tests can be started with the following command:
```shell script
./entrypoint.sh <path-to-config-file>
```


## Configuration
There are two parts to the configuration:
 - `./high-load.yml` - the main config file for [Artillery.io], containing:
   - basic test setup
   - authentication details
   - config for the phases
   - payload parameters (the information to match)
   - scenarios (what requests to send, and how responses are processed)
 - a [Config file] supplied to `./entrypoint.sh`, with authentication details:
   - an endpoint for the target service
   - an authorization token
   - SSL certificate information
   - files with search terms

### Config file
An example config file is provided (`./config-example.template.conf`). This
shows and describes the supported configuration options. Copies of this file
can be created in a config directory (`./config`) if you wish, as this folder
is ignored by git. Obviously **DO NOT commit potentially sensitive information
to github**!! The necessary `.crt` and `.key` files can also be placed in the
`./config` directory.

### A note about scenarios
Each scenario defines a type of dummy user action which Artillery will mimic
during the test. There two main actions; a search (by name and date of birth),
and a direct lookup (by system number). Each of these actions has two different
forms; a _probably_ successful form where the parameters are randomly selected
from the corresponding payload file, and a _probably_ not successful form where
parameters are randomly generated (see `./src/randomisor.js`).

Normally a mix of these scenarios is run (weighted in favour of the generated
kind), to force the DB to perform searches (rather than simply read from
caches). Therefore `404` is considered to be a successful HTTP response code
(in addition to `200`, obviously). This is quite expected, as there will likely
always be searches for records that don't exist, e.g. typos, hard to read
handwriting, etc.

### Other types of test
Currently, only the `high-load.yml` file exists - intended to expose the API to
an arbitrary amount of usage. Other configurations could be created to test for
specific tolerances and bottlenecks, e.g. DB throttling, API scaling thresholds,
ingress and other routing thresholds, etc. All of these are currently beyond the
scope of this project though.

NOTE: recently the [connection pool] option was used to reuse client connections
which meant once the first few connections were created, very little further
client processing was required for each request. This allowed us to explore the
limits of our API and DB resources (rather than sweat the test devices). If the
client machines start to struggle, the test should be abandoned and the settings
revised. See the [high CPU warnings] section of the Artillery docs.
 

[LEV API]: https://github.com/UKHomeOffice/lev-api
[Artillery.io]: https://artillery.io/docs/
[Config file]: #config-file
[connection pool]: https://artillery.io/docs/http-reference/#fixed-connection-pool
[high CPU warnings]: https://artillery.io/docs/faq/#high-cpu-warnings