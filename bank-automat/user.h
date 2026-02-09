#ifndef USER_H
#define USER_H

#include <QString>
#include <QJsonObject>

class user
{
public:
    user();
    QString idUser;
    QString firstName;
    QString lastName;
    QString streetAddress;
    QString role;
    static user mapJson(const QJsonObject &json);
};

#endif // USER_H
