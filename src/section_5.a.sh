# ------------------------------------------------------------------------
#
# TheEye.io - Bash Boilerplate for writing script tasks
#
# ------------------------------------------------------------------------
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games
export LANG=en_US.UTF-8  
export LANGUAGE=en_US:en  
export LC_ALL=en_US.UTF-8 

export HOME="${HOME:=~}"

# Enable error handling
set -euo pipefail

# uncomment with bash>4.4 only
shopt -s inherit_errexit nullglob compat"${BASH_COMPAT=42}"

trap 'catch_output $? $LINENO' ERR
trap 'catch_output $? $LINENO' EXIT

PROGNAME=$(basename $0)
#alias echo="printf"

function catch_output
{
  if [ "$1" != "0" ];
  then
	  echo "Error $1 occurred on $2" && failure_output
  fi
}

function failure_output
{
  echo "{\"state\":\"failure\",\"data\":[\"error\"]}"
  exit 1
}

function success_output
{
  # remove end of line characters
  #output=$(tr -d '\r|\n' < output.json)
  # jq alternative (recommended)
  output=$(cat output.json | jq -c '.')
  printf '{"state":"success","data":%b}' "${output}"
  exit 0
}

#DEPLOY_PATH="${DEPLOY_PATH:=/opt/theeye}"

# ------------------------------------------------------------------------
#
# write your code into main function
#
# ------------------------------------------------------------------------
function main 
{

  DEPLOY_PATH=${1}
  REPO_NAME=${2}
  BRANCH=${3}

	#ssh-keyscan -H "github.com" > ~/.ssh/known_hosts

  echo "> starting sources deploy"

  cd "${DEPLOY_PATH}"

  #
  # Format: theeye-io-team/tutorials
  #
  repo_url="https://github.com/${REPO_NAME}.git"
  
  cd ${DEPLOY_PATH}
  echo "> now on ${PWD}"

  if [[ -d "${DEPLOY_PATH}/${REPO_NAME}" ]]
  then
    echo ">> removing old repo ${REPO_NAME} in ${DEPLOY_PATH}"
  	rm -rf "${DEPLOY_PATH}/${REPO_NAME}"
  fi

  echo "> creating repo ${DEPLOY_PATH}/${REPO_NAME}"
  git clone --branch "${BRANCH}" "${repo_url}" "${DEPLOY_PATH}/${REPO_NAME}"
  
  cd "${DEPLOY_PATH}/${REPO_NAME}"
  echo "now on ${PWD}"

  echo "> pulling sources"
  git fetch
  git reset --hard origin/${BRANCH}

	echo "> installing dependencies"
  npm install

  version=$(git describe || echo "0")

  cd ${SCRIPT_DIR}
  # build the JSON output if needed
  cat << EOF > ./output.json
[ {"sources version":"${version}"} ]
EOF
  
  # output.json will be handled for you
  return 0 # success exit code
}


[ -z ${REPO_NAME+x} ] && echo "\$REPO_NAME not defined" && exit;

if [ -z ${BRANCH+y} ]
then
  echo "\$BRANCH not defined. using main"
  BRANCH="main"
fi

if [ -z ${DEPLOY_PATH+z} ]
then
  echo "\$DEPLOY_PATH not defined. using ${PWD}"
  DEPLOY_PATH=${PWD}
fi

main ${DEPLOY_PATH} ${REPO_NAME} ${BRANCH} && success_output

