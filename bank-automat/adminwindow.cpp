#include "adminwindow.h"
#include "ui_adminwindow.h"
#include <qpainter.h>

adminwindow::adminwindow(QString user, QWidget *parent)
    : QWidget(parent)
    , ui(new Ui::adminwindow),
    user(user)
{
    ui->setupUi(this);
    ui->labelAdminUser->setText("Adminkäyttäjä: "+user);
}

adminwindow::~adminwindow()
{
    delete ui;
}

//adminruudun tausta, jälleen sama
void adminwindow::paintEvent(QPaintEvent *event)
{
    QPainter painter(this);
    static const QPixmap selectPix(":/images/backgroundLogin.png");
    painter.drawPixmap(rect(), selectPix);
}
