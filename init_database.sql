CREATE TABLE IF NOT EXISTS transactions(
        id NUMERIC PRIMARY KEY,
        org_ID NUMERIC NOT NULL,
        branch_ID NUMERIC NOT NULL,
        ticketSequence integer NOT NULL,
        symbol text NOT NULL,
        service_ID NUMERIC NOT NULL,
        segment_ID NUMERIC NOT NULL,
        priority integer NOT NULL,
        orderOfServing integer NOT NULL,
        note text NULL,
        recallNo integer NOT NULL,
        holdCount integer NOT NULL,
        holdReason_ID NUMERIC NULL,
        appointment_ID NUMERIC NULL,
        servingSession NUMERIC NULL,
        origin integer not NULL,
        state integer not NULL,
        servingType integer not NULL,
        visit_ID NUMERIC not NULL,
        serveStep integer not NULL,
        lastOfVisit integer not NULL,
        reminderState integer not NULL,
        integration_ID NUMERIC NULL,
        smsTicket NUMERIC NULL,
        displayTicketNumber text not NULL,
        hall_ID NUMERIC NOT NULL,
        arrivalTime NUMERIC not NULL,
        appointmentTime NUMERIC NULL,
        waitingSeconds NUMERIC NULL,
        serviceSeconds NUMERIC NULL,
        holdingSeconds NUMERIC NULL,
        lastCallTime NUMERIC NULL,
        endServingTime NUMERIC NULL,
        waitingStartTime NUMERIC NULL,
        priorityTime NUMERIC not NULL,
        startServingTime NUMERIC NULL,
        creationTime NUMERIC not NULL,
        closeTime NUMERIC NULL,
        counter_ID NUMERIC NULL,
        user_ID NUMERIC NULL,
        transferredByUser_ID NUMERIC NULL,
        transferredByCounter_ID NUMERIC NULL,
        transferredFromService_ID NUMERIC NULL,
        heldByCounter_ID NUMERIC NULL,
        dispensedByUser_ID NUMERIC NULL,
        dispensedByCounter_ID NUMERIC NULL,
        assignedByCounter_ID NUMERIC NULL
);

CREATE TABLE IF NOT EXISTS userActivites(
        id NUMERIC PRIMARY KEY,
        type  integer NOT NULL,
        user_ID  NUMERIC NOT NULL,
        counter_ID  NUMERIC NOT NULL,
        startTime  NUMERIC NOT NULL,
        endTime  NUMERIC NULL,
        lastActionTime  NUMERIC NULL,
        duration  integer NULL,
        calenderDuration  integer NULL,
        closed  integer NOT NULL
);
