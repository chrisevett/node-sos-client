/// <reference path="../external-ts-definitions/request.d.ts" />

import request = require('request');
import PluginBase = require('../plugin');
import PollResultStatus = PluginBase.PollResultStatus;

interface IOctopusResponse {
    id: number;
    status: string;
}

export class Octopus extends PluginBase.PluginBase {
    poll(config: any, callback: (err?: Error, pollResult?: PluginBase.PollResult) => void): void {
        // todo: decide what options are needed for octopus plugin 
        var opts = {
            auth: {
                username: config.username,
                password: config.password
            },
            headers: {
                'x-Octopus-ApiKey': config.apiKey
            },
            rejectUnauthorized: false,
            requestCert: true,
            agent: false,
            json: true
        };

        // we're going to have to make several requests here 
        // we know what project we want, start there and poll our project of interest for releases
        // find the latest release, find associated deployments 
        // projects/releases
        // releaseid/deployments
        // latest deployment/tasks
        // did it fail

        // base urls

        var baseReleaseUrl; // todo the rest of these

        // request our releases 
        request.get(config.url, opts, (err, resp) => {
            if (err) {
                return callback(err);
            }
            console.log(resp.body);
            var octopusResponse: IOctopusResponse = <IOctopusResponse>resp.body;
            return callback(null, {
                status: this.toPollResultStatus(octopusResponse.status),
                id: octopusResponse.id.toString(10)
            });
        });


        // request our deployments 
        request.get(config.url, opts, (err, resp) => {
            if (err) {
                return callback(err);
            }
            console.log(resp.body);
            var octopusResponse: IOctopusResponse = <IOctopusResponse>resp.body;
            return callback(null, {
                status: this.toPollResultStatus(octopusResponse.status),
                id: octopusResponse.id.toString(10)
            });
        });


        // request tasks, invoke callback with status 
        request.get(config.url, opts, (err, resp) => {
            if (err) {
                return callback(err);
            }
            console.log(resp.body);
            var octopusResponse: IOctopusResponse = <IOctopusResponse>resp.body;
            return callback(null, {
                status: this.toPollResultStatus(octopusResponse.status),
                id: octopusResponse.id.toString(10)
            });
        });
    }

    // todo: see if these poll result statuses make sense for octopus
    toPollResultStatus(status: string): PollResultStatus {
        if (status === 'SUCCESS') return PollResultStatus.SUCCESS;
        if (status === 'FAILURE') return PollResultStatus.FAILURE;
        if (status === 'ERROR') {
            console.error("error state returned from octopus");
            // when the server is down for maintenance just pretend that is passed, for now
            return PollResultStatus.SUCCESS;
        }
        console.error("unexpected response from octopus: " + status);
        return PollResultStatus.FAILURE;
    }





}