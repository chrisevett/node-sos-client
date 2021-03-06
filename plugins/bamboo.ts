
/// <reference path="../external-ts-definitions/request.d.ts" />

import request = require('request');
import PluginBase = require('../plugin');

interface BambooResult {
    state: string;
    id: number;
}

interface BambooResults {
    result: BambooResult[];
}

interface BambooResponse {
    results: BambooResults;
}

export class Bamboo extends PluginBase.PluginBase {
    poll(config: any, callback: (err?: Error, pollResult?: PluginBase.PollResult) => void): void {
        var opts = {
            auth: {
                username: config.username,
                password: config.password
            },
            rejectUnauthorized: false,
            requestCert: true,
            agent: false
        };
        request.get(config.url, opts, (err, resp) => {
            if(err) {
                return callback(err);
            }
            var bambooResp: BambooResponse = <BambooResponse>JSON.parse(resp.body);
            if(bambooResp.results.result.length > 0) {
                var status = bambooResp.results.result[0];
                return callback(null, {
                   status: this.toPollResultStatus(status.state),
                   id: status.id.toString()
                });
            }
            return callback();
        });
    }
    
    toPollResultStatus(state: string): PluginBase.PollResultStatus {
        state = state.toLowerCase();
        if(state == 'successful') {
            return PluginBase.PollResultStatus.SUCCESS;
        }
        console.error("unknown bamboo state:", state);
        return PluginBase.PollResultStatus.FAILURE;
    }
}
