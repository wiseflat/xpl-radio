# xpl-radio
Node JS layer to execute mplayer through xPL

## Installation

    $ git clone https://github.com/wiseflat/xpl-radio.git
    $ npm update

## Usage

You need to install the xPL_Hub first : https://github.com/Tieske/xPL4Linux

Send xpl-cmnd to get the configuration of the module

    $ xpl-send -m cmnd -c radio.request

Send xpl-cmnd to add/update a configuration

    $ xpl-send -m cmnd -c radio.config file=file1.mp3 enable=true

Send xpl-cmnd to execute your script

    $ xpl-send -m cmnd -c radio.basic url=file1.mp3 command=play|stop|loop|timeLimit|stopTimeLimit