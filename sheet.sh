#!/bin/sh
# usage: sheet.sh prefix out  (tiles prefix_a..d 2x2)
p=$1
ffmpeg -y -loglevel error -i ${p}_a.png -i ${p}_b.png -i ${p}_c.png -i ${p}_d.png -filter_complex "[0]scale=800:-1[a];[1]scale=800:-1[b];[2]scale=800:-1[c];[3]scale=800:-1[d];[a][b]hstack[t];[c][d]hstack[u];[t][u]vstack" $2
