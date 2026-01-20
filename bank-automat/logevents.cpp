#include "logevents.h"

logevents::logevents() {}

logevents logevents::mapJson(const QJsonObject &json)
{
    logevents logevent;
    logevent.idlog = json["idlog"].toInt();
    logevent.idaccount = json["idaccount"].toInt();
    logevent.time = json["time"].toString();
    logevent.balancechange = json["balancechange"].toDouble();
    return logevent;
}
