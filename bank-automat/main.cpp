#include "mainwindow.h"

#include <QApplication>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    MainWindow w;
    //Widget heti koko ruudun kokoiseksi
    w.showMaximized();
    return a.exec();
}
