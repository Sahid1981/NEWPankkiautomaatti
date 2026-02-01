#include "logevents.h"

logevents::logevents() {}

logevents logevents::mapJson(const QJsonObject &json)
{
    logevents logevent;
    logevent.idLog = json["idLog"].toInt();
    logevent.idAccount = json["idAccount"].toInt();
    logevent.time = json["time"].toString();
    logevent.balanceChange = json["balanceChange"].toDouble();
    return logevent;
}
