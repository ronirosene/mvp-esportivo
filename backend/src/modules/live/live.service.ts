import { Injectable, Logger } from '@nestjs/common';
import { LiveGateway } from './live.gateway';

@Injectable()
export class LiveService {
  private readonly logger = new Logger(LiveService.name);

  constructor(private readonly gateway: LiveGateway) {}

  emitMatchStarted(matchId: string, data: any) {
    this.logger.log(`emit matchStarted match=${matchId}`);
    this.gateway.emitToMatch(matchId, 'matchStarted', data);
    this.gateway.emitToEventSport(data.eventSportId, 'matchStarted', data);
  }

  emitScoreUpdated(matchId: string, eventSportId: string, data: any) {
    this.logger.log(`emit scoreUpdated match=${matchId}`);
    this.gateway.emitToMatch(matchId, 'scoreUpdated', data);
    this.gateway.emitToEventSport(eventSportId, 'scoreUpdated', data);
  }

  emitMatchUpdated(matchId: string, eventSportId: string, eventId: string, organizationId: string | null, data: any) {
    this.logger.log(`emit matchUpdated match=${matchId}`);
    this.gateway.emitToMatch(matchId, 'matchUpdated', data);
    this.gateway.emitToEventSport(eventSportId, 'matchUpdated', data);
    this.gateway.emitToEvent(eventId, 'matchUpdated', data);
    if (organizationId) {
      this.gateway.emitToOrganization(organizationId, 'matchUpdated', data);
    }
  }

  emitMatchFinished(matchId: string, eventSportId: string, data: any) {
    this.logger.log(`emit matchFinished match=${matchId}`);
    this.gateway.emitToMatch(matchId, 'matchFinished', data);
    this.gateway.emitToEventSport(eventSportId, 'matchFinished', data);
  }

  emitMatchCancelled(matchId: string, eventSportId: string, data: any) {
    this.logger.log(`emit matchCancelled match=${matchId}`);
    this.gateway.emitToMatch(matchId, 'matchCancelled', data);
    this.gateway.emitToEventSport(eventSportId, 'matchCancelled', data);
  }

  emitStandingsUpdated(eventSportId: string, data: any) {
    this.logger.log(`emit standingsUpdated eventSport=${eventSportId}`);
    this.gateway.emitToEventSport(eventSportId, 'standingsUpdated', data);
  }

  emitPlayoffsUpdated(eventSportId: string, data: any) {
    this.logger.log(`emit playoffsUpdated eventSport=${eventSportId}`);
    this.gateway.emitToEventSport(eventSportId, 'playoffsUpdated', data);
  }

  emitChampionDefined(eventSportId: string, data: any) {
    this.logger.log(`emit championDefined eventSport=${eventSportId}`);
    this.gateway.emitToEventSport(eventSportId, 'championDefined', data);
  }
}
